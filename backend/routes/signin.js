import express from 'express';
import bcrypt from 'bcryptjs';

// Builds the /api/signin router. Dependencies are injected so the route can be
// unit-tested against an in-memory MongoDB without loading the whole server.
export function createSigninRouter({ findOne, signJwt }) {
  const router = express.Router();

  router.post('/', async (req, res) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password || String(password).trim().length === 0) {
        return res.status(400).json({ ok: false, error: 'email and password are required' });
      }

      const safe = String(email).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const account = await findOne('signups', { email: new RegExp('^' + safe + '$', 'i') });
      if (!account) {

        return res.status(401).json({ ok: false, error: 'No account found for this email. Please sign up first.' });
      }

      const matched = await bcrypt.compare(String(password).trim(), account.passwordHash || '');
      if (!matched) {
        return res.status(401).json({ ok: false, error: 'Incorrect password.' });
      }

      if (!account.verified) {
        return res.status(403).json({ ok: false, error: 'Please verify your email before signing in.', requiresVerification: true });
      }

      const token = signJwt(account);
      res.json({
        ok: true,
        token,
        user: {
          name: account.name, email: account.email, phone: account.phone,
          whatsappNumber: account.whatsappNumber || '', verified: account.verified, role: account.role || 'user',
        },
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ ok: false, error: 'Sign in failed' });
    }
  });

  return router;
}
