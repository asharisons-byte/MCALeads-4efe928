import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

// Prefer Neon / Vercel PostgreSQL connection string, fallback to legacy Cloud SQL variables
const postgresUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.NEON_DATABASE_URL;
const sqlHost = process.env.SQL_HOST;
const sqlDbName = process.env.SQL_DB_NAME;
const user = process.env.SQL_ADMIN_USER || process.env.SQL_USER;
const password = process.env.SQL_ADMIN_PASSWORD || process.env.SQL_PASSWORD;

let dbCredentialsConfig: any;

if (postgresUrl) {
  // Neon / Vercel PostgreSQL mode using connection string
  console.log("Using Neon / PostgreSQL connection string for Drizzle Kit.");
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
    "Either DATABASE_URL / POSTGRES_URL (Neon/Vercel) or SQL_HOST/SQL_DB_NAME/SQL_USER/SQL_PASSWORD must be set in environment variables."
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
