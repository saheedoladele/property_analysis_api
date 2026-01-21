import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth';
import propertyRoutes from './routes/properties';
import analysisRoutes from './routes/analyses';
import subscriptionRoutes from './routes/subscriptions';
import paymentRoutes from './routes/payments';
import dealAuditRoutes from './routes/dealAudits';
import contactRoutes from './routes/contact';
import postcodeRoutes from './routes/postcodes';
import landRegistryRoutes from './routes/landRegistry';
import epcRoutes from './routes/epc';
import healthRoutes from './routes/health';

// Load environment variables
dotenv.config();

export function createApp(): Express {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS configuration
  const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  };
  app.use(cors(corsOptions));

  // Body parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
  });
  app.use('/api/', limiter);

  // Health check endpoint (simple)
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/properties', propertyRoutes);
  app.use('/api/analyses', analysisRoutes);
  app.use('/api/subscriptions', subscriptionRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/deal-audits', dealAuditRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api/postcodes', postcodeRoutes);
  app.use('/api/land-registry', landRegistryRoutes);
  app.use('/api/epc', epcRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
}
