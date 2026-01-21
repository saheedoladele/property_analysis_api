import { DataSource } from "typeorm";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const AppDataSource = new DataSource({
  type: (process.env.DB_TYPE as any) || "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "saheedbaba",
  password: process.env.DB_PASSWORD || "saheed123",
  database: process.env.DB_DATABASE || "property_db",

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
