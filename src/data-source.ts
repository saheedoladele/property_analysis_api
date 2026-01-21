import { DataSource } from "typeorm";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const AppDataSource = new DataSource({
  type: "postgres",
  // Use connection string if provided, otherwise fall back to individual config
  url: process.env.DATABASE_URL || "postgresql://saheedbaba:nkY3b7r34pE6HmzGUIONsHKNKq9rO93i@dpg-d5l0p4mmcj7s73a9u8s0-a.oregon-postgres.render.com/property_db_acrj",
  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
  
  synchronize: process.env.NODE_ENV !== "production",
  logging: process.env.NODE_ENV === "development",
  // Use string paths to avoid circular dependency issues with ES modules
  entities: [path.join(__dirname, "entities", "**", "*.js")],
  migrations: [path.join(__dirname, "migrations", "**", "*.js")],
  subscribers: [path.join(__dirname, "subscribers", "**", "*.js")],
});
