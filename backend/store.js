import { ObjectId } from 'mongodb';

function normalizeId(id) {
  // If an id is an ObjectId-like string, convert it.
  // Otherwise keep it as-is.
  if (typeof id !== 'string') return id;
  if (ObjectId.isValid(id)) return new ObjectId(id);
  return id;
}

function applySort(options = {}) {
  if (!options.sort) return null;
  // expects { sort: { createdAt: -1 } }
  return options.sort;
}

function applyLimit(options = {}) {
  if (typeof options.limit === 'number') return options.limit;
  return null;
}

function toMongoQuery(query = {}) {
  const mongoQuery = {};
  for (const [k, v] of Object.entries(query || {})) {
    if (v instanceof RegExp) {
      mongoQuery[k] = v;
    } else if (k === '_id') {
      mongoQuery[k] = normalizeId(v);
    } else {
      mongoQuery[k] = v;
    }
  }
  return mongoQuery;
}

// getDb() is defined in backend/mongoClient.js
import { getDb } from './mongoClient.js';

// Re-export for backward compatibility (server.js imports getDb from ./store.js).
export { getDb };

async function getCollection(collectionName) {
  const db = await getDb();
  return db.collection(collectionName);
}



export async function createDocument(collectionName, doc) {
  const coll = await getCollection(collectionName);
  const now = new Date();
  const newDoc = {
    ...doc,
    createdAt: doc.createdAt || now,
  };
  const res = await coll.insertOne(newDoc);
  return { ...newDoc, _id: res.insertedId };
}

export async function findById(collectionName, id) {
  const coll = await getCollection(collectionName);
  const _id = normalizeId(id);
  const doc = await coll.findOne({ _id });
  return doc || null;
}

export async function findOne(collectionName, query) {
  const coll = await getCollection(collectionName);
  const mongoQuery = toMongoQuery(query);
  return coll.findOne(mongoQuery);
}

export async function find(collectionName, query = {}, options = {}) {
  const coll = await getCollection(collectionName);
  const mongoQuery = toMongoQuery(query);

  let cursor = coll.find(mongoQuery);

  const sort = applySort(options);
  if (sort) cursor = cursor.sort(sort);

  const limit = applyLimit(options);
  if (limit) cursor = cursor.limit(limit);

  return cursor.toArray();
}

export async function updateOne(collectionName, query, update) {
  const coll = await getCollection(collectionName);
  const mongoQuery = toMongoQuery(query);
  const updateDoc = update?.$set ? update : { $set: update || {} };

  const res = await coll.findOneAndUpdate(mongoQuery, updateDoc, { returnDocument: 'after' });
  return res.value || null;
}

export async function updateById(collectionName, id, update) {
  const coll = await getCollection(collectionName);
  const _id = normalizeId(id);
  const updateDoc = update?.$set ? update : { $set: update || {} };

  const res = await coll.findOneAndUpdate({ _id }, updateDoc, { returnDocument: 'after' });
  return res.value || null;
}

export async function upsertOne(collectionName, query, update) {
  const coll = await getCollection(collectionName)
  const mongoQuery = toMongoQuery(query)
  const updateDoc = update?.$set ? update : { $set: update || {} }

  const res = await coll.findOneAndUpdate(mongoQuery, updateDoc, {
    upsert: true,
    returnDocument: 'after',
  })
  return res.value || null
}

export async function deleteOne(collectionName, query) {
  const coll = await getCollection(collectionName)
  const mongoQuery = toMongoQuery(query)
  const res = await coll.deleteOne(mongoQuery)
  return res.deletedCount > 0
}

export async function deleteMany(collectionName, query = {}) {
  const coll = await getCollection(collectionName);
  const mongoQuery = toMongoQuery(query);
  if (!query || Object.keys(query).length === 0) {
    const count = await coll.countDocuments({});
    await coll.deleteMany({});
    return count;
  }
  const res = await coll.deleteMany(mongoQuery);
  return res.deletedCount || 0;
}

export async function countDocuments(collectionName, query = {}) {
  const coll = await getCollection(collectionName);
  const mongoQuery = toMongoQuery(query);
  return coll.countDocuments(mongoQuery);
}

export async function clearCollection(collectionName) {
  const coll = await getCollection(collectionName);
  await coll.deleteMany({});
}

export async function clearAll() {
  const db = await getDb();
  const collections = await db.listCollections().toArray();
  await Promise.all(collections.map((c) => db.collection(c.name).deleteMany({})));
}

