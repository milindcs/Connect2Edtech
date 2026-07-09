import { MongoMemoryServer } from 'mongodb-memory-server'

let memoryServer = null

// Resolves the MongoDB connection URI.
// Priority:
//   1. USE_MEMORY_DB=true  -> spin up an in-memory MongoDB (great for local dev)
//   2. MONGODB_URI         -> Atlas / remote cluster
//   3. MONGODB_LOCAL       -> explicit local URI
//   4. localhost fallback
// When no external URI is configured at all, an in-memory server is started
// so the app is runnable out of the box for development.
export async function getMongoUri() {
  // If an external Mongo URI is provided, prefer it over the in-memory DB.
  // This avoids unexpected in-memory startup failures in production-like environments.
  const wantMemory =
    process.env.USE_MEMORY_DB === 'true' &&
    (!process.env.MONGODB_URI && !process.env.MONGODB_LOCAL);


  if (wantMemory) {
    if (!memoryServer) {
      console.log('[MongoDB] starting in-memory server for local dev...');
      memoryServer = await MongoMemoryServer.create();
    }
    return memoryServer.getUri();
  }

  return process.env.MONGODB_URI || process.env.MONGODB_LOCAL || 'mongodb://localhost:27017/connect2edtech';
}

export async function stopMemoryServer() {
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
