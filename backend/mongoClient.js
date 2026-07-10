import { MongoClient } from 'mongodb';
import dns from 'node:dns';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from backend directory
const __dirname = fileURLToPath(new URL('.', import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

// Some sandboxed/dev environments point Node's DNS resolver at an unreachable
// 127.0.0.1. Allow overriding it via DNS_SERVERS (comma-separated). Left unset
// in production where the system resolver is correct.
if (process.env.DNS_SERVERS) {
  const servers = process.env.DNS_SERVERS.split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (servers.length) dns.setServers(servers);
}

const uri = process.env.MONGODB_URI || process.env.MONGODB_URL || process.env.MONGOURI || '';
if (!uri) {
  // Don’t throw at import-time in case some environments don’t use DB.
  // Consumers will throw when connecting.
  console.warn('[mongoClient] Missing MONGODB_URI/MONGODB_URL');
}

let clientPromise;

export function getMongoClient() {
  if (!clientPromise) {
    if (!uri) {
      throw new Error('Missing MONGODB_URI (or MONGODB_URL) in environment');
    }

    const client = new MongoClient(uri, {
      // Safe defaults for common hosted Mongo setups
      maxPoolSize: 10,
    });

    clientPromise = client.connect().then(() => client);
  }

  return clientPromise;
}

export async function getDb() {
  const client = await getMongoClient();

  // If DB name is provided in the URI, mongodb will expose it as client.db().
  // Otherwise, fall back to env DB_NAME.
  const dbName = process.env.MONGODB_DB_NAME;
  return dbName ? client.db(dbName) : client.db();
}

