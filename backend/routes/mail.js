import express from 'express';

// Builds the /api/mail router (mail inbox + reply). Mount it with staffAuth so
// only admins and HR can read inquiries and reply. Dependencies are injected so
// the route can be unit-tested without loading the whole server.
export function createMailRouter({ findOne, updateById, find, sendEmail }) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const items = find('contacts', {}, { sort: { createdAt: -1 } }).slice(0, 200);
      res.json({ ok: true, messages: items });
    } catch (e) {
      console.error(e);
      res.status(500).json({ ok: false, error: 'Failed to load inbox.' });
    }
  });

  router.post('/:id/reply', async (req, res) => {
    try {
      const { id } = req.params;
      const { subject, message } = req.body || {};
      if (!subject || !message) {
        return res.status(400).json({ ok: false, error: 'subject and message are required' });
      }
      if (!isValidId(id)) {
        return res.status(400).json({ ok: false, error: 'Invalid message id.' });
      }

      const contact = findOne('contacts', { _id: id });
      if (!contact) {
        return res.status(404).json({ ok: false, error: 'Message not found.' });
      }
      if (!contact.email) {
        return res.status(400).json({ ok: false, error: 'This inquiry has no email address to reply to.' });
      }

      const fromName = req.admin?.name || req.user?.name || 'Connect2Edtech Team';
      const body = String(message).trim();
      const text = `${body}\n\n— ${fromName}, Connect2Edtech`;
      const html = `<p>${body.replace(/\n/g, '<br/>')}</p><p>— ${fromName}, Connect2Edtech</p>`;

      try {
        await sendEmail({ to: contact.email, subject: String(subject).trim(), text, html });
      } catch (mailErr) {
        console.error('[Mail] reply failed:', mailErr?.message || mailErr);
        return res.status(502).json({ ok: false, error: 'Failed to send reply email.' });
      }

      const updated = updateById('contacts', id, {
        replies: [...(contact.replies || []), { from: fromName, body, at: new Date() }],
        replied: true,
      })

      res.json({ ok: true, message: 'Reply sent.', contact: updated });
    } catch (e) {
      console.error(e);
      res.status(500).json({ ok: false, error: 'Failed to send reply.' });
    }
  });

  return router;
}

function isValidId(id) {
  return typeof id === 'string' && /^[a-fA-F0-9-]{8,}$/.test(id);
}
