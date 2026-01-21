import dotenv from 'dotenv';

dotenv.config();

interface PayPalAccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface PayPalOrder {
  id: string;
  status: string;
  purchase_units: Array<{
    payments?: {
      captures?: Array<{
        amount: {
          currency_code: string;
          value: string;
        };
      }>;
    };
  }>;
  payer?: any;
  links?: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export class PayPalService {
  private baseUrl: string;
  private tokenUrl: string;
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    const isProduction = process.env.PAYPAL_ENVIRONMENT === 'production';
    // API base URL for regular API calls
    this.baseUrl = isProduction
      ? 'https://api.paypal.com'
      : 'https://api.sandbox.paypal.com';
    // Token endpoint uses api-m subdomain
    this.tokenUrl = isProduction
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
    this.clientId = process.env.PAYPAL_CLIENT_ID || '';
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';

    if (!this.clientId || !this.clientSecret) {
      throw new Error('PayPal credentials are not configured');
    }
  }

  /**
   * Get OAuth access token
   * Matches curl: -X POST "https://api-m.sandbox.paypal.com/v1/oauth2/token" \
   *               -u "CLIENT_ID:CLIENT_SECRET" \
   *               -H "Content-Type: application/x-www-form-urlencoded" \
   *               -d "grant_type=client_credentials"
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // Create Basic Auth header (equivalent to -u "CLIENT_ID:CLIENT_SECRET")
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    try {
      const response = await fetch(`${this.tokenUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get access token: ${response.status} ${errorText}`);
      }

      const data = await response.json() as PayPalAccessToken;
      this.accessToken = data.access_token;
      // Set expiry to 5 minutes before actual expiry for safety
      this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
      
      return this.accessToken;
    } catch (error: any) {
      console.error('PayPal access token error:', error);
      throw new Error(`Failed to get PayPal access token: ${error.message}`);
    }
  }

  /**
   * Make authenticated request to PayPal API
   */
  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    return response;
  }

  /**
   * Generate a unique request ID for PayPal
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Create a PayPal order
   * Follows curl structure: POST https://api-m.sandbox.paypal.com/v2/checkout/orders
   */
  async createOrder(amount: number, currency: string = 'GBP'): Promise<{
    orderId: string;
    approvalUrl: string;
  }> {
    const orderData = {
      intent: 'CAPTURE',
      payment_source: {
        paypal: {
          experience_context: {
            payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
            landing_page: 'LOGIN',
            shipping_preference: 'NO_SHIPPING',
            user_action: 'PAY_NOW',
            return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/toolkit`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/toolkit?canceled=true`,
          },
        },
      },
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
        },
      ],
    };

    // Generate unique request ID for idempotency
    const requestId = this.generateRequestId();

    try {
      const token = await this.getAccessToken();
      
      // Use api-m subdomain for order creation (same as token endpoint)
      const response = await fetch(`${this.tokenUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'PayPal-Request-Id': requestId,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PayPal API error: ${response.status} ${errorText}`);
      }

      const data = await response.json() as PayPalOrder;
      if (data.id) {
        // Find the approval URL from links
        const approvalLink = data.links?.find((link: any) => link.rel === 'approve');
        
        let approvalUrl: string;
        if (approvalLink?.href) {
          approvalUrl = approvalLink.href;
        } else {
          // Construct approval URL manually
          // Format: https://sandbox.paypal.com/pay?token=<order_id>
          const isProduction = process.env.PAYPAL_ENVIRONMENT === 'production';
          const paypalDomain = isProduction 
            ? 'https://www.paypal.com'
            : 'https://sandbox.paypal.com';
          approvalUrl = `${paypalDomain}/pay?token=${data.id}`;
        }
        
        
        return {
          orderId: data.id,
          approvalUrl,
        };
      }
      throw new Error('Failed to create PayPal order: No order ID returned');
    } catch (error: any) {
      console.error('PayPal order creation error:', error);
      throw new Error(`PayPal order creation failed: ${error.message}`);
    }
  }

  /**
   * Capture a PayPal order
   */
  async captureOrder(orderId: string): Promise<{
    id: string;
    status: string;
    amount: { currency_code: string; value: string };
    payer?: any;
  }> {
    try {
      const response = await this.makeRequest(`/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PayPal API error: ${response.status} ${errorText}`);
      }

      const data = await response.json() as PayPalOrder;

      return {
        id: data.id || orderId,
        status: data.status || 'COMPLETED',
        amount: data.purchase_units?.[0]?.payments?.captures?.[0]?.amount || {
          currency_code: 'GBP',
          value: '0.00',
        },
        payer: data.payer,
      };
    } catch (error: any) {
      console.error('PayPal capture error:', error);
      throw new Error(`PayPal capture failed: ${error.message}`);
    }
  }

  /**
   * Get order details
   */
  async getOrder(orderId: string): Promise<PayPalOrder> {
    try {
      const response = await this.makeRequest(`/v2/checkout/orders/${orderId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PayPal API error: ${response.status} ${errorText}`);
      }

      const data = await response.json() as PayPalOrder;
      return data;
    } catch (error: any) {
      console.error('PayPal get order error:', error);
      throw new Error(`PayPal get order failed: ${error.message}`);
    }
  }

  /**
   * Verify webhook signature
   */
  async verifyWebhook(
    headers: Record<string, string | string[] | undefined>,
    body: string,
    webhookId: string
  ): Promise<boolean> {
    try {
      const webhookEvent = typeof body === 'string' ? JSON.parse(body) : body;

      const verificationData = {
        auth_algo: headers['paypal-auth-algo'] as string,
        cert_url: headers['paypal-cert-url'] as string,
        transmission_id: headers['paypal-transmission-id'] as string,
        transmission_sig: headers['paypal-transmission-sig'] as string,
        transmission_time: headers['paypal-transmission-time'] as string,
        webhook_id: webhookId,
        webhook_event: webhookEvent,
      };

      const response = await this.makeRequest('/v1/notifications/verify-webhook-signature', {
        method: 'POST',
        body: JSON.stringify(verificationData),
      });

      if (!response.ok) {
        console.error('Webhook verification failed:', await response.text());
        return false;
      }

      const result = await response.json() as { verification_status?: string };
      return result.verification_status === 'SUCCESS';
    } catch (error: any) {
      console.error('Webhook verification error:', error);
      return false;
    }
  }
}
