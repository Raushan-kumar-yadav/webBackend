// server/src/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';

// Create __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from file (adjust path if your .env location differs)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// - check that env var is present and of correct type
const rawDbUrl = process.env.DATABASE_URL ?? process.env.DATABASE_URL_STRING ?? null;
console.log('DATABASE_URL typeof:', typeof rawDbUrl);
if (!rawDbUrl) {
  throw new Error('DATABASE_URL is not set. Please set it in your environment or .env file.');
}

// Ensure it's a string for the pg client (coerce if necessary)
const connectionString = String(rawDbUrl);

// Create pg Pool and Drizzle instance
const pool = new Pool({
  connectionString,
  // optional: ssl: { rejectUnauthorized: false } // if needed for hosted DBs
});

export const db = drizzle(pool);
export default db;
