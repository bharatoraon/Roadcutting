import "dotenv/config";
import { Pool } from "pg";

export const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "cmarks",
  password: process.env.DB_PASSWORD || "postgres",
  port: process.env.DB_PORT || 5432,
  // SSL configuration for Azure PostgreSQL
  ssl:
    process.env.DB_SSL === "true"
      ? {
          rejectUnauthorized: false, // Azure PostgreSQL uses self-signed certs
        }
      : false,
});
console.log("Database Pool Config:", process.env.DB_PASSWORD);
export default pool;
