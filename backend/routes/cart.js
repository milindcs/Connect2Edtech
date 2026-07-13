import express from 'express';

const trimmed = (v) => (typeof v === 'string' ? v.trim() : '');

export function createCartRouter({ find, createDocument, updateById, deleteOne }) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const sessionId = String(req.headers['x-session-id'] || req.ip || '').trim();
      if (!sessionId) {
        return res.json({ ok: true, items: [] });
      }
      const items = await find('cart', { sessionId }, { sort: { addedAt: -1 } });
      res.json({ ok: true, items });
    } catch (e) {
      console.error(e);
      res.status(500).json({ ok: false, error: 'Failed to load cart.' });
    }
  });

  router.post('/add', async (req, res) => {
    try {
      const { courseKey, title, price, image } = req.body || {};
      const sessionId = String(req.headers['x-session-id'] || req.ip || '').trim();
      if (!sessionId || !courseKey) {
        return res.status(400).json({ ok: false, error: 'sessionId and courseKey are required' });
      }

      const safeCourseKey = String(courseKey).trim();
      const existing = await find('cart', { sessionId, courseKey: safeCourseKey });
      if (existing.length > 0) {
        return res.json({ ok: true, items: existing, message: 'Item already in cart.' });
      }

      const item = await createDocument('cart', {
        sessionId,
        courseKey: safeCourseKey,
        title: trimmed(title),
        price: typeof price === 'number' ? price : 0,
        image: trimmed(image),
      });

      res.json({ ok: true, item });
    } catch (e) {
      console.error(e);
      res.status(500).json({ ok: false, error: 'Failed to add to cart.' });
    }
  });

  router.delete('/:courseKey', async (req, res) => {
    try {
      const sessionId = String(req.headers['x-session-id'] || req.ip || '').trim();
      const { courseKey } = req.params;
      if (!sessionId) {
        return res.status(400).json({ ok: false, error: 'Missing session id' });
      }

      const safeCourseKey = String(courseKey).trim();
      const existing = await find('cart', { sessionId, courseKey: safeCourseKey });
      if (existing.length === 0) {
        return res.status(404).json({ ok: false, error: 'Item not found in cart.' });
      }

      await deleteOne('cart', { sessionId, courseKey: safeCourseKey });
      res.json({ ok: true, message: 'Removed from cart.' });
    } catch (e) {
      console.error(e);
      res.status(500).json({ ok: false, error: 'Failed to remove from cart.' });
    }
  });

  router.delete('/', async (req, res) => {
    try {
      const sessionId = String(req.headers['x-session-id'] || req.ip || '').trim();
      if (!sessionId) {
        return res.status(400).json({ ok: false, error: 'Missing session id' });
      }
      await deleteOne('cart', { sessionId });
      res.json({ ok: true, message: 'Cart cleared.' });
    } catch (e) {
      console.error(e);
      res.status(500).json({ ok: false, error: 'Failed to clear cart.' });
    }
  });

  return router;
}
