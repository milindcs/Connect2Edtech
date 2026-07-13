import express from 'express';

const trimmed = (v) => (typeof v === 'string' ? v.trim() : '');

export function createCheckoutRouter({ find, createDocument, updateById, deleteOne }) {
  const router = express.Router();

  router.post('/submit', async (req, res) => {
    try {
      const { name, email, phone, college, items, total, paymentRef } = req.body || {};
      const sessionId = String(req.headers['x-session-id'] || req.ip || '').trim();
      if (!name || !email || !phone || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ ok: false, error: 'name, email, phone, and items are required' });
      }

      const checkout = await createDocument('checkouts', {
        sessionId,
        name: trimmed(name),
        email: String(email).trim(),
        phone: trimmed(phone),
        college: trimmed(college || ''),
        items: items.map((it) => ({
          courseKey: String(it.courseKey || '').trim(),
          title: String(it.title || '').trim(),
          price: typeof it.price === 'number' ? it.price : 0,
          image: String(it.image || '').trim(),
        })),
        total: typeof total === 'number' ? total : 0,
        status: 'completed',
        paymentRef: trimmed(paymentRef || ''),
      });

      if (sessionId) {
        await deleteOne('cart', { sessionId });
      }

      res.json({ ok: true, message: 'Checkout submitted successfully.', checkout });
    } catch (e) {
      console.error(e);
      res.status(500).json({ ok: false, error: 'Checkout failed. Please try again.' });
    }
  });

  router.get('/me/checkouts', async (req, res) => {
    try {
      const header = req.headers.authorization || '';
      const match = header.match(/^Bearer\s+(.+)$/i);
      if (!match) {
        return res.status(401).json({ ok: false, error: 'Missing token' });
      }
      const token = match[1];
      const jwt = await import('jsonwebtoken').then((m) => m.default);
      const JWT_SECRET = process.env.JWT_SECRET || 'connect2edtech-jwt-secret-change-in-production';
      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch {
        return res.status(401).json({ ok: false, error: 'Invalid or expired token' });
      }

      const items = await find('checkouts', { email: decoded.email }, { sort: { createdAt: -1 } });
      res.json({ ok: true, checkouts: items });
    } catch (e) {
      console.error(e);
      res.status(500).json({ ok: false, error: 'Failed to fetch checkouts.' });
    }
  });

  return router;
}
