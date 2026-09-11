import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

// Prefer Vercel PostgreSQL connection string, fallback to legacy Cloud SQL variables
const postgresUrl = process.env.POSTGRES_URL;
const sqlHost = process.env.SQL_HOST;
const sqlDbName = process.env.SQL_DB_NAME;
const user = process.env.SQL_ADMIN_USER || process.env.SQL_USER;
const password = process.env.SQL_ADMIN_PASSWORD || process.env.SQL_PASSWORD;

let dbCredentialsConfig: any;

if (postgresUrl) {
  // Vercel/Neon PostgreSQL mode using connection string
  console.log("Using Vercel PostgreSQL connection string for Drizzle Kit.");
  dbCredentialsConfig = {
    url: postgresUrl,
  };
} else if (sqlHost && sqlDbName && user && password) {
  // Legacy Cloud SQL mode
  console.log(`Using legacy Cloud SQL credentials (user: ${user}) for Drizzle Kit.`);
  dbCredentialsConfig = {
    host: sqlHost,
    user: user,
    password: password,
    database: sqlDbName,
    ssl: false,
  };
} else {
  throw new Error(
    "Either POSTGRES_URL (Vercel) or SQL_HOST/SQL_DB_NAME/SQL_USER/SQL_PASSWORD (Cloud SQL) must be set in environment variables."
  );
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: dbCredentialsConfig,
  verbose: true,
});
