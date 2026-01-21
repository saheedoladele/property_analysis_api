import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Property } from "./entities/Property";
import { Analysis } from "./entities/Analysis";
import { Subscription } from "./entities/Subscription";
import { Payment } from "./entities/Payment";
import { DealAudit } from "./entities/DealAudit";
import { Contact } from "./entities/Contact";
import dotenv from "dotenv";

dotenv.config();

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
  entities: [User, Property, Analysis, Subscription, Payment, DealAudit, Contact],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: ["src/subscribers/**/*.ts"],
});
