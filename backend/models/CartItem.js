export function normalizeCartItem(doc = {}) {
  return {
    _id: doc._id,
    sessionId: doc.sessionId || '',
    courseKey: doc.courseKey || '',
    title: doc.title || '',
    price: doc.price || 0,
    image: doc.image || '',
    addedAt: doc.addedAt || new Date(),
  };
}
