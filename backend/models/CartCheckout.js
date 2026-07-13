export const CHECKOUT_STATUSES = ['pending', 'completed', 'failed'];

export function normalizeCartCheckout(doc = {}) {
  return {
    _id: doc._id,
    sessionId: doc.sessionId || '',
    email: doc.email || '',
    name: doc.name || '',
    phone: doc.phone || '',
    college: doc.college || '',
    items: Array.isArray(doc.items) ? doc.items : [],
    total: doc.total || 0,
    status: CHECKOUT_STATUSES.includes(doc.status) ? doc.status : 'pending',
    paymentRef: doc.paymentRef || '',
    createdAt: doc.createdAt || new Date(),
  };
}
