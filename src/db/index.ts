import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import type { ConnectionOptions } from 'tls';
import * as schema from './schema.js';

// Add global connection pool caching to persist across hot-reloads
declare global {
  var _postgresPool: Pool | undefined;
}

// Function to create or retrieve the connection pool.
export const createPool = () => {
  if (!global._postgresPool) {
    // Support Vercel PostgreSQL via POSTGRES_URL connection string
    const postgresUrl = process.env.POSTGRES_URL;

    if (postgresUrl) {
      // Vercel/Neon PostgreSQL connection string mode
      global._postgresPool = new Pool({
        connectionString: postgresUrl,
        max: 10,
        connectionTimeoutMillis: 15000,
        ssl: { rejectUnauthorized: false } as unknown as ConnectionOptions,
      });
    } else if (process.env.SQL_HOST) {
      // Legacy Cloud SQL mode with individual environment variables
      global._postgresPool = new Pool({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DB_NAME,
        max: 10,
        connectionTimeoutMillis: 15000,
      });
    } else {
      // No database configured - return null pool
      return null;
    }

    // Prevent unhandled pool-level errors from crashing the application
    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

// Create or retrieve the pool instance.
const pool = createPool();

// Initialize Drizzle with the pool and schema (only if pool exists).
export const db = pool ? drizzle(pool, { schema }) : null;
export const isDbConfigured = Boolean(process.env.POSTGRES_URL || process.env.SQL_HOST);
export { schema };
