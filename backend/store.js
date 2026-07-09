import { randomUUID } from 'crypto';

const collections = {};

export function getCollection(name) {
  if (!collections[name]) {
    collections[name] = [];
  }
  return collections[name];
}

export function createDocument(collectionName, doc) {
  const collection = getCollection(collectionName);
  const newDoc = {
    ...doc,
    _id: typeof randomUUID === 'function' ? randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: doc.createdAt || new Date(),
  };
  collection.push(newDoc);
  return newDoc;
}

export function findById(collectionName, id) {
  const collection = getCollection(collectionName);
  return collection.find((doc) => doc._id === id) || null;
}

export function findOne(collectionName, query) {
  const collection = getCollection(collectionName);
  return collection.find((doc) => {
    return Object.keys(query).every((key) => {
      if (query[key] instanceof RegExp) {
        return query[key].test(String(doc[key] || ''));
      }
      return doc[key] === query[key];
    });
  }) || null;
}

export function find(collectionName, query = {}, options = {}) {
  let collection = getCollection(collectionName);

  if (query && Object.keys(query).length > 0) {
    collection = collection.filter((doc) => {
      return Object.keys(query).every((key) => {
        const val = query[key];
        if (val instanceof RegExp) {
          return val.test(String(doc[key] || ''));
        }
        return doc[key] === val;
      });
    });
  }

  if (options.sort) {
    const sortKey = Object.keys(options.sort)[0];
    const sortDir = options.sort[sortKey];
    collection = [...collection].sort((a, b) => {
      const aVal = a[sortKey] || '';
      const bVal = b[sortKey] || '';
      if (aVal < bVal) return sortDir === -1 ? 1 : -1;
      if (aVal > bVal) return sortDir === -1 ? -1 : 1;
      return 0;
    });
  }

  if (typeof options.limit === 'number') {
    collection = collection.slice(0, options.limit);
  }

  return collection;
}

export function updateOne(collectionName, query, update) {
  const collection = getCollection(collectionName);
  const index = collection.findIndex((doc) => {
    return Object.keys(query).every((key) => doc[key] === query[key]);
  });

  if (index === -1) return null;

  const existing = collection[index];
  const $set = update.$set || {};

  if (Object.keys(query).length === 1 && Object.keys(query)[0] === '_id') {
    collection[index] = { ...existing, ...$set, _id: existing._id };
    return collection[index];
  }

  collection[index] = { ...existing, ...$set };
  return collection[index];
}

export function updateById(collectionName, id, update) {
  const collection = getCollection(collectionName);
  const index = collection.findIndex((doc) => doc._id === id);

  if (index === -1) return null;

  const existing = collection[index];
  const $set = update.$set || update;

  collection[index] = { ...existing, ...$set, _id: existing._id };
  return collection[index];
}

export function deleteOne(collectionName, query) {
  const collection = getCollection(collectionName);
  const index = collection.findIndex((doc) => {
    return Object.keys(query).every((key) => doc[key] === query[key]);
  });

  if (index === -1) return false;

  collection.splice(index, 1);
  return true;
}

export function deleteMany(collectionName, query = {}) {
  const collection = getCollection(collectionName);
  if (Object.keys(query).length === 0) {
    const removed = collection.length;
    collections[collectionName] = [];
    return removed;
  }

  const removed = collection.filter((doc) => {
    return Object.keys(query).every((key) => doc[key] === query[key]);
  }).length;

  collections[collectionName] = collection.filter((doc) => {
    return !Object.keys(query).every((key) => doc[key] === query[key]);
  });

  return removed;
}

export function countDocuments(collectionName, query = {}) {
  if (Object.keys(query).length === 0) {
    return getCollection(collectionName).length;
  }
  return find(collectionName, query).length;
}

export function clearCollection(collectionName) {
  collections[collectionName] = [];
}

export function clearAll() {
  Object.keys(collections).forEach((key) => {
    collections[key] = [];
  });
}
