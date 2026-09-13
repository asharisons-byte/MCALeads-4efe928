import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import type { ConnectionOptions } from 'tls';
import * as schema from './schema.js';

// Add global connection pool caching to persist across hot-reloads
declare global {
  var _postgresPool: Pool | undefined;
}

// Function to resolve connection string from environment variables
export const getDatabaseUrl = (): string | undefined => {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL ||
    undefined
  );
};

export interface DatabaseDetails {
  configured: boolean;
  provider: string;
  host: string;
  database: string;
  user?: string;
  sslMode: string;
  isNeon: boolean;
  maskedUrl: string;
  rawEnvKeyUsed: string;
}

export function getDatabaseDetails(): DatabaseDetails {
  const url = getDatabaseUrl();
  const rawEnvKeyUsed = process.env.DATABASE_URL
    ? 'DATABASE_URL'
    : process.env.POSTGRES_URL
    ? 'POSTGRES_URL'
    : process.env.NEON_DATABASE_URL
    ? 'NEON_DATABASE_URL'
    : process.env.SQL_HOST
    ? 'SQL_HOST'
    : 'NONE';

  if (url) {
    try {
      const parsed = new URL(url);
      const isNeon = parsed.hostname.includes('neon.tech');
      return {
        configured: true,
        provider: isNeon ? 'Neon Serverless PostgreSQL' : 'PostgreSQL Database',
        host: parsed.hostname,
        database: parsed.pathname.replace(/^\//, '') || 'neondb',
        user: parsed.username || 'neondb_owner',
        sslMode: parsed.searchParams.get('sslmode') || 'require',
        isNeon,
        maskedUrl: `${parsed.protocol}//${parsed.username}:••••••••@${parsed.hostname}${parsed.pathname}`,
        rawEnvKeyUsed,
      };
    } catch {
      const isNeon = url.includes('neon.tech');
      return {
        configured: true,
        provider: isNeon ? 'Neon Serverless PostgreSQL' : 'PostgreSQL Database',
        host: isNeon ? 'ep-*.neon.tech' : 'configured via URL',
        database: 'neondb',
        sslMode: 'require',
        isNeon,
        maskedUrl: 'postgresql://••••••••@configured-host/neondb',
        rawEnvKeyUsed,
      };
    }
  }

  if (process.env.SQL_HOST) {
    return {
      configured: true,
      provider: 'Google Cloud SQL',
      host: process.env.SQL_HOST,
      database: process.env.SQL_DB_NAME || 'crm_db',
      user: process.env.SQL_USER,
      sslMode: 'standard',
      isNeon: false,
      maskedUrl: `postgresql://${process.env.SQL_USER}:••••••••@${process.env.SQL_HOST}/${process.env.SQL_DB_NAME}`,
      rawEnvKeyUsed,
    };
  }

  return {
    configured: false,
    provider: 'In-Memory Resilient Store',
    host: 'localhost',
    database: 'in-memory',
    sslMode: 'none',
    isNeon: false,
    maskedUrl: 'memory://local',
    rawEnvKeyUsed,
  };
}

// Function to create or retrieve the connection pool.
export const createPool = () => {
  if (!global._postgresPool) {
    const postgresUrl = getDatabaseUrl();

    if (postgresUrl) {
      // Neon / Vercel PostgreSQL connection string mode
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
export const isDbConfigured = Boolean(
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.NEON_DATABASE_URL ||
  process.env.SQL_HOST
);
export { schema };
