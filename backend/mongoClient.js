import { MongoClient } from "mongodb";
import dns from "node:dns";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Prefer IPv4 when resolving DNS
dns.setDefaultResultOrder("ipv4first");

// Load .env
const __dirname = fileURLToPath(new URL(".", import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

// Optional custom DNS servers
if (process.env.DNS_SERVERS) {
  const servers = process.env.DNS_SERVERS
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (servers.length) {
    dns.setServers(servers);
  }
}

const uri =
  process.env.MONGODB_URI ||
  process.env.MONGODB_URL ||
  process.env.MONGOURI;

if (!uri) {
  console.warn("Missing MONGODB_URI in .env");
}

let client;

export async function getMongoClient() {
  if (!client) {
    client = new MongoClient(uri, {
      maxPoolSize: 10,
    });

    await client.connect();
  }

  return client;
}

export async function getDb() {
  const mongoClient = await getMongoClient();

  if (process.env.MONGODB_DB_NAME) {
    return mongoClient.db(process.env.MONGODB_DB_NAME);
  }

  return mongoClient.db();
}