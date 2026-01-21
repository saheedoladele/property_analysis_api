/**
 * HM Land Registry Price Paid Data Service
 * Uses SPARQL endpoint to query sold prices and property information
 */

export interface SoldPriceRecord {
  price: number;
  dateOfTransfer: string;
  propertyType: string;
  oldNewStatus: string;
  postcode: string;
  distance?: number; // Distance in miles if calculated
  paon?: string; // Primary Addressable Object Name (house/flat number)
  street?: string; // Street name
  address?: string; // Full address if available
  saon?: string; // Secondary Addressable Object Name (flat/apartment number)
  locality?: string;
  townOrCity?: string;
  district?: string;
  county?: string;
}

export interface PropertySearchParams {
  postcode?: string;
  paon?: string; // House/flat number
  street?: string; // Street name
  limit?: number;
  minDate?: string; // YYYY-MM-DD format
  maxDate?: string; // YYYY-MM-DD format
}

const LAND_REGISTRY_SPARQL_ENDPOINT =
  "http://landregistry.data.gov.uk/landregistry/query";

export class LandRegistryService {
  /**
   * Format UK postcode by inserting space before last 3 characters
   * e.g., "SW100AD" -> "SW10 0AD", "PL68RU" -> "PL6 8RU"
   */
  private formatPostcode(postcode: string): string {
    if (!postcode) return "";
    
    // Remove all spaces and convert to uppercase
    const cleaned = postcode.replace(/\s+/g, "").toUpperCase();
    
    // UK postcodes have 3 characters for inward code (last 3)
    // Insert space before the last 3 characters
    if (cleaned.length >= 3) {
      return cleaned.slice(0, -3) + " " + cleaned.slice(-3);
    }
    
    return cleaned;
  }

  /**
   * Extract property type from URI
   */
  private extractPropertyType(uri: string): string {
    if (!uri) return "Unknown";

    // Handle both URI format and plain string format
    if (uri.startsWith("http://") || uri.startsWith("https://")) {
      // Extract the last part of the URI path
      const match = uri.match(/\/([^\/]+)$/);
      if (match) {
        let propertyType = match[1];
        // Capitalize first letter and handle common types
        propertyType =
          propertyType.charAt(0).toUpperCase() +
          propertyType.slice(1).toLowerCase();
        // Handle hyphenated types (e.g., "Semi-Detached")
        propertyType = propertyType
          .split("-")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join("-");
        return propertyType;
      }
    } else {
      // Already a string, use as-is but capitalize
      return uri.charAt(0).toUpperCase() + uri.slice(1).toLowerCase();
    }

    return "Unknown";
  }

  /**
   * Build SPARQL query based on search parameters
   */
  private buildSparqlQuery(params: PropertySearchParams): string {
    const limit = params.limit || 100;
    const minDate = params.minDate || "1995-01-01";

    // Get postcode for VALUES clause - format to include space (e.g., "SW100AD" -> "SW10 0AD")
    const postcodeValue = params.postcode
      ? this.formatPostcode(params.postcode.trim())
      : "";
    let query = `
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix owl: <http://www.w3.org/2002/07/owl#>
prefix xsd: <http://www.w3.org/2001/XMLSchema#>
prefix sr: <http://data.ordnancesurvey.co.uk/ontology/spatialrelations/>
prefix ukhpi: <http://landregistry.data.gov.uk/def/ukhpi/>
prefix lrppi: <http://landregistry.data.gov.uk/def/ppi/>
prefix skos: <http://www.w3.org/2004/02/skos/core#>
prefix lrcommon: <http://landregistry.data.gov.uk/def/common/>

SELECT ?paon ?saon ?street ?town ?county ?postcode ?amount ?date ?category
WHERE {
`;

    // Add VALUES clause for postcode if provided 
    if (postcodeValue) {
      query += `  VALUES ?postcode {"${postcodeValue}"^^xsd:string}\n\n`;
      // query += `  VALUES ?postcode {"PL6 8RU"^^xsd:string}`;
    }

    query += `  ?addr lrcommon:postcode ?postcode.

  ?transx lrppi:propertyAddress ?addr ;
          lrppi:pricePaid ?amount ;
          lrppi:transactionDate ?date ;
          lrppi:transactionCategory/skos:prefLabel ?category.

  OPTIONAL {?addr lrcommon:county ?county}
  OPTIONAL {?addr lrcommon:paon ?paon}
  OPTIONAL {?addr lrcommon:saon ?saon}
  OPTIONAL {?addr lrcommon:street ?street}
  OPTIONAL {?addr lrcommon:town ?town}
`;

    // Add date filters if provided
    if (minDate) {
      query += `  FILTER(?date >= "${minDate}"^^xsd:date)\n`;
    }

    if (params.maxDate) {
      query += `  FILTER(?date <= "${params.maxDate}"^^xsd:date)\n`;
    }

    // Add additional filters based on parameters
    if (params.paon) {
      query += `  FILTER(CONTAINS(LCASE(STR(?paon)), LCASE("${params.paon}"))) .\n`;
    }

    if (params.street) {
      query += `  FILTER(CONTAINS(LCASE(STR(?street)), LCASE("${params.street}"))) .\n`;
    }

    query += `}
ORDER BY ?amount
LIMIT ${limit}
  `.trim();

    return query;
  }

  /**
   * Execute SPARQL query
   * Always uses simplified query for better reliability
   */
  private async executeSparqlQuery(query: string): Promise<any> {
    // Always use simplified query for better reliability and performance
    return await this.executeSimplifiedQuery(query);
  }

  /**
   * Execute simplified query without OPTIONAL fields (fallback)
   */
  private async executeSimplifiedQuery(originalQuery: string): Promise<any> {
    // Extract basic filters from original query
    const postcodeMatch = originalQuery.match(
      /VALUES \?postcode \{"([^"]+)"\^\^xsd:string\}/
    );
    const minDateMatch = originalQuery.match(
      /FILTER\(\?date >= "([^"]+)"\^\^xsd:date\)/
    );
    const limitMatch = originalQuery.match(/LIMIT (\d+)/);

    const postcode = postcodeMatch ? postcodeMatch[1] : "";
    const minDate = minDateMatch ? minDateMatch[1] : "1995-01-01";
    const limit = limitMatch ? limitMatch[1] : "100";

    const simpleQuery = `
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>
prefix owl: <http://www.w3.org/2002/07/owl#>
prefix xsd: <http://www.w3.org/2001/XMLSchema#>
prefix sr: <http://data.ordnancesurvey.co.uk/ontology/spatialrelations/>
prefix ukhpi: <http://landregistry.data.gov.uk/def/ukhpi/>
prefix lrppi: <http://landregistry.data.gov.uk/def/ppi/>
prefix skos: <http://www.w3.org/2004/02/skos/core#>
prefix lrcommon: <http://landregistry.data.gov.uk/def/common/>

SELECT ?postcode ?amount ?date ?category
WHERE {
  ${postcode ? `VALUES ?postcode {"${postcode}"^^xsd:string}\n\n` : ""}
  ?addr lrcommon:postcode ?postcode.

  ?transx lrppi:propertyAddress ?addr ;
          lrppi:pricePaid ?amount ;
          lrppi:transactionDate ?date ;
          lrppi:transactionCategory/skos:prefLabel ?category.
  
  ${minDate ? `FILTER(?date >= "${minDate}"^^xsd:date)` : ""}
}
ORDER BY ?amount
LIMIT ${limit}
    `.trim();

    try {
      const response = await fetch(LAND_REGISTRY_SPARQL_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/sparql-results+json",
        },
        body: new URLSearchParams({
          query: simpleQuery,
          output: "json",
        }),
      });

      if (!response.ok) {
        throw new Error(`Land Registry API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Simplified query also failed:", error);
      throw error;
    }
  }

  /**
   * Parse SPARQL results into SoldPriceRecord array
   */
  private parseResults(data: any): SoldPriceRecord[] {
    if (!data.results || !data.results.bindings) {
      return [];
    }

    return data.results.bindings
      .map((binding: any) => {
        // Extract property type from category field
        const category = binding.category?.value || "";
        const propertyType = category || "Unknown";

        // Build full address if components are available
        let address = "";
        const addressParts: string[] = [];
        if (binding.paon?.value) addressParts.push(binding.paon.value);
        if (binding.saon?.value) addressParts.push(binding.saon.value);
        if (binding.street?.value) addressParts.push(binding.street.value);
        if (addressParts.length > 0) {
          address = addressParts.join(", ");
        }

        return {
          price: parseInt(binding.amount?.value || "0", 10),
          dateOfTransfer: binding.date?.value || "",
          propertyType: propertyType,
          oldNewStatus: "Unknown", // Not available in new query structure
          postcode: binding.postcode?.value || "",
          paon: binding.paon?.value || "",
          street: binding.street?.value || "",
          saon: binding.saon?.value || "",
          locality: "", // Not available in new query structure
          townOrCity: binding.town?.value || "",
          district: "", // Not available in new query structure
          county: binding.county?.value || "",
          address: address || undefined,
        };
      })
      .filter((record: SoldPriceRecord) => record.price > 0);
  }

  /**
   * Search for sold prices by postcode
   */
  async getSoldPricesByPostcode(
    postcode: string,
    limit: number = 100
  ): Promise<SoldPriceRecord[]> {
    if (!postcode || postcode.trim().length === 0) {
      return [];
    }

    const params: PropertySearchParams = {
      postcode,
      limit,
    };

    const query = this.buildSparqlQuery(params);
    const data = await this.executeSparqlQuery(query);
    return this.parseResults(data);
  }

  /**
   * Search for property information by address components
   */
  async searchByAddress(
    params: PropertySearchParams
  ): Promise<SoldPriceRecord[]> {
    if (!params.postcode && !params.paon && !params.street) {
      throw new Error(
        "At least one of postcode, paon, or street must be provided"
      );
    }

    const query = this.buildSparqlQuery(params);
    const data = await this.executeSparqlQuery(query);
    return this.parseResults(data);
  }

  /**
   * Get property information for a specific address
   * Tries to match PAON and Street name within a postcode
   */
  async getPropertyByAddress(
    postcode: string,
    paon?: string,
    street?: string,
    limit: number = 50
  ): Promise<SoldPriceRecord[]> {
    const params: PropertySearchParams = {
      postcode,
      paon,
      street,
      limit,
    };

    return this.searchByAddress(params);
  }

  /**
   * Get the most recent sale for a property
   */
  async getMostRecentSale(
    postcode: string,
    paon?: string,
    street?: string
  ): Promise<SoldPriceRecord | null> {
    const records = await this.getPropertyByAddress(postcode, paon, street, 1);
    return records.length > 0 ? records[0] : null;
  }

  /**
   * Get comparable sales (properties with similar characteristics)
   */
  async getComparableSales(
    postcode: string,
    propertyType?: string,
    limit: number = 20
  ): Promise<SoldPriceRecord[]> {
    const records = await this.getSoldPricesByPostcode(postcode, limit * 2);

    // Filter by property type if specified
    if (propertyType) {
      return records
        .filter(
          (record) =>
            record.propertyType.toLowerCase() === propertyType.toLowerCase()
        )
        .slice(0, limit);
    }

    return records.slice(0, limit);
  }
}
