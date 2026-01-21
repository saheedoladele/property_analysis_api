/**
 * Postcode Service using Postcodes.io API
 * https://postcodes.io/
 */

export interface PostcodeAutocompleteResult {
  postcode: string;
}

export interface PostcodeLookupResult {
  postcode: string;
  quality: number;
  eastings: number;
  northings: number;
  country: string;
  nhs_ha: string;
  longitude: number;
  latitude: number;
  european_electoral_region: string;
  primary_care_trust: string;
  region: string;
  lsoa: string;
  msoa: string;
  incode: string;
  outcode: string;
  parliamentary_constituency: string;
  admin_district: string;
  parish: string;
  admin_county: string | null;
  admin_ward: string;
  ced: string | null;
  ccg: string;
  nuts: string;
  codes: {
    admin_district: string;
    admin_county: string | null;
    admin_ward: string;
    parish: string | null;
    parliamentary_constituency: string;
    ccg: string;
    ccg_id: string;
    ced: string | null;
    nuts: string;
    lsoa: string;
    msoa: string;
    lau2: string;
  };
}

interface PostcodesApiResponse<T> {
  status: number;
  result: T;
}

interface PostcodesApiError {
  status: number;
  error: string;
}

const POSTCODES_API_BASE = "https://api.postcodes.io";

export class PostcodeService {
  /**
   * Format postcode to standard UK format (with space before last 3 characters)
   */
  private formatPostcode(postcode: string): string {
    const clean = postcode.trim().replace(/\s+/g, "").toUpperCase();
    if (clean.length >= 5) {
      return clean.slice(0, -3) + " " + clean.slice(-3);
    }
    return clean;
  }

  /**
   * Autocomplete postcode suggestions
   * @param query - Partial postcode query (minimum 2 characters)
   * @returns Array of postcode suggestions
   */
  async autocompletePostcode(
    query: string
  ): Promise<PostcodeAutocompleteResult[]> {
    if (query.trim().length < 2) {
      return [];
    }

    try {
      // Clean the query - remove spaces and convert to uppercase
      const cleanQuery = query.trim().replace(/\s+/g, "").toUpperCase();

      // Use the autocomplete endpoint for better results
      const response = await fetch(
        `${POSTCODES_API_BASE}/postcodes/${encodeURIComponent(
          cleanQuery
        )}/autocomplete`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        // If autocomplete fails, try the search endpoint as fallback
        if (response.status === 404) {
          const searchResponse = await fetch(
            `${POSTCODES_API_BASE}/postcodes?q=${encodeURIComponent(
              cleanQuery
            )}`
          );

          if (searchResponse.ok) {
            const searchData =
              (await searchResponse.json()) as PostcodesApiResponse<string[]>;
            if (searchData.status === 200 && Array.isArray(searchData.result)) {
              return searchData.result
                .slice(0, 10) // Limit to 10 results
                .map((postcode) => ({
                  postcode: this.formatPostcode(postcode),
                }));
            }
          }
        }
        return [];
      }

      const data = (await response.json()) as PostcodesApiResponse<string[]>;

      if (data.status === 200 && Array.isArray(data.result)) {
        // Format postcodes properly and limit results
        return data.result
          .slice(0, 10) // Limit to 10 results
          .map((postcode) => ({
            postcode: this.formatPostcode(postcode),
          }));
      }

      return [];
    } catch (error) {
      console.error("Error fetching postcode autocomplete:", error);
      return [];
    }
  }

  /**
   * Lookup full postcode details
   * @param postcode - Full postcode (with or without spaces)
   * @returns Postcode lookup result or null if not found
   */
  async lookupPostcode(postcode: string): Promise<PostcodeLookupResult | null> {
    if (!postcode || postcode.trim().length === 0) {
      return null;
    }

    try {
      // Format postcode: ensure it has proper spacing
      const formattedPostcode = this.formatPostcode(postcode);

      // Try with formatted postcode first
      let response = await fetch(
        `${POSTCODES_API_BASE}/postcodes/${encodeURIComponent(
          formattedPostcode
        )}`
      );

      // If that fails, try without space
      if (!response.ok && response.status === 404) {
        const noSpacePostcode = formattedPostcode.replace(/\s+/g, "");
        response = await fetch(
          `${POSTCODES_API_BASE}/postcodes/${encodeURIComponent(
            noSpacePostcode
          )}`
        );
      }

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const errorData = (await response.json()) as PostcodesApiError;
        throw new Error(
          `Postcodes API error: ${errorData.error || response.status}`
        );
      }

      const data =
        (await response.json()) as PostcodesApiResponse<PostcodeLookupResult>;

      if (data.status === 200 && data.result) {
        return data.result;
      }

      return null;
    } catch (error) {
      console.error("Error fetching postcode lookup:", error);
      throw error;
    }
  }

  /**
   * Validate postcode format and existence
   * @param postcode - Postcode to validate
   * @returns true if valid, false otherwise
   */
  async validatePostcode(postcode: string): Promise<boolean> {
    if (!postcode || postcode.trim().length === 0) {
      return false;
    }

    try {
      const result = await this.lookupPostcode(postcode);
      return result !== null;
    } catch {
      return false;
    }
  }

  /**
   * Bulk postcode lookup
   * @param postcodes - Array of postcodes to lookup
   * @returns Array of lookup results (null for invalid postcodes)
   */
  async bulkLookupPostcodes(
    postcodes: string[]
  ): Promise<(PostcodeLookupResult | null)[]> {
    if (!postcodes || postcodes.length === 0) {
      return [];
    }

    try {
      // Format postcodes
      const formattedPostcodes = postcodes.map((p) => this.formatPostcode(p));

      const response = await fetch(`${POSTCODES_API_BASE}/postcodes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          postcodes: formattedPostcodes,
        }),
      });

      if (!response.ok) {
        throw new Error(`Postcodes API error: ${response.status}`);
      }

      const data = (await response.json()) as PostcodesApiResponse<
        Array<{ query: string; result: PostcodeLookupResult | null }>
      >;

      if (data.status === 200 && Array.isArray(data.result)) {
        return data.result.map((item) => item.result);
      }

      return postcodes.map(() => null);
    } catch (error) {
      console.error("Error fetching bulk postcode lookup:", error);
      return postcodes.map(() => null);
    }
  }

  /**
   * Get nearest postcodes to a given postcode
   * @param postcode - Reference postcode
   * @param radius - Radius in meters (default: 1000)
   * @param limit - Maximum number of results (default: 10)
   * @returns Array of nearby postcodes
   */
  async getNearestPostcodes(
    postcode: string,
    radius: number = 1000,
    limit: number = 10
  ): Promise<PostcodeLookupResult[]> {
    if (!postcode || postcode.trim().length === 0) {
      return [];
    }

    try {
      const formattedPostcode = this.formatPostcode(postcode);

      const response = await fetch(
        `${POSTCODES_API_BASE}/postcodes/${encodeURIComponent(
          formattedPostcode
        )}/nearest?radius=${radius}&limit=${limit}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        throw new Error(`Postcodes API error: ${response.status}`);
      }

      const data = (await response.json()) as PostcodesApiResponse<
        PostcodeLookupResult[]
      >;

      if (data.status === 200 && Array.isArray(data.result)) {
        return data.result;
      }

      return [];
    } catch (error) {
      console.error("Error fetching nearest postcodes:", error);
      return [];
    }
  }
}
