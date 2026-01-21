import { Request, Response } from "express";
import { AppDataSource } from "../data-source.js";

export class HealthController {
  /**
   * GET /api/health
   * Comprehensive health check endpoint
   */
  check = async (req: Request, res: Response): Promise<void> => {
    const health = {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0",
      services: {
        database: {
          status: "unknown",
          message: "",
        },
        postcodesApi: {
          status: "unknown",
          message: "",
        },
        landRegistryApi: {
          status: "unknown",
          message: "",
        },
      },
    };

    let overallStatus = "ok";

    // Check database connection
    try {
      if (AppDataSource.isInitialized) {
        await AppDataSource.query("SELECT 1");
        health.services.database = {
          status: "healthy",
          message: "Database connection active",
        };
      } else {
        health.services.database = {
          status: "unhealthy",
          message: "Database not initialized",
        };
        overallStatus = "degraded";
      }
    } catch (error: any) {
      health.services.database = {
        status: "unhealthy",
        message: error.message || "Database connection failed",
      };
      overallStatus = "degraded";
    }

    // Check Postcodes.io API
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(
        "https://api.postcodes.io/random",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
        }
      );
      
      clearTimeout(timeoutId);

      if (response.ok) {
        health.services.postcodesApi = {
          status: "healthy",
          message: "Postcodes.io API is accessible",
        };
      } else {
        health.services.postcodesApi = {
          status: "degraded",
          message: `Postcodes.io API returned ${response.status}`,
        };
        if (overallStatus === "ok") overallStatus = "degraded";
      }
    } catch (error: any) {
      health.services.postcodesApi = {
        status: "unhealthy",
        message: error.message || "Postcodes.io API unavailable",
      };
      if (overallStatus === "ok") overallStatus = "degraded";
    }

    // Check Land Registry API (lightweight check)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(
        "http://landregistry.data.gov.uk/landregistry/query",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/sparql-results+json",
          },
          body: new URLSearchParams({
            query: "SELECT ?s WHERE { ?s ?p ?o } LIMIT 1",
            output: "json",
          }),
          signal: controller.signal,
        }
      );
      
      clearTimeout(timeoutId);

      if (response.ok || response.status === 400) {
        // 400 is acceptable (invalid query but API is responding)
        health.services.landRegistryApi = {
          status: "healthy",
          message: "Land Registry API is accessible",
        };
      } else {
        health.services.landRegistryApi = {
          status: "degraded",
          message: `Land Registry API returned ${response.status}`,
        };
        if (overallStatus === "ok") overallStatus = "degraded";
      }
    } catch (error: any) {
      health.services.landRegistryApi = {
        status: "unhealthy",
        message: error.message || "Land Registry API unavailable",
      };
      if (overallStatus === "ok") overallStatus = "degraded";
    }

    health.status = overallStatus;

    const statusCode = overallStatus === "ok" ? 200 : overallStatus === "degraded" ? 200 : 503;
    res.status(statusCode).json(health);
  };

  /**
   * GET /api/health/live
   * Liveness probe - simple check if server is running
   */
  liveness = async (req: Request, res: Response): Promise<void> => {
    res.json({
      status: "alive",
      timestamp: new Date().toISOString(),
    });
  };

  /**
   * GET /api/health/ready
   * Readiness probe - check if server is ready to accept requests
   */
  readiness = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!AppDataSource.isInitialized) {
        res.status(503).json({
          status: "not ready",
          message: "Database not initialized",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Quick database ping
      await AppDataSource.query("SELECT 1");

      res.json({
        status: "ready",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(503).json({
        status: "not ready",
        message: error.message || "Database connection failed",
        timestamp: new Date().toISOString(),
      });
    }
  };
}
