import express from 'express';
import bcrypt from 'bcryptjs';

const trimmed = (v) => (typeof v === 'string' ? v.trim() : '');

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Builds the /api/signup router. Dependencies are injected so the route can be
// unit-tested against an in-memory MongoDB without loading the whole server.
const ALLOWED_ROLES = ['user', 'hr', 'admin'];

export function createSignupRouter({ connectStore, createDocument, updateById, sendOtpEmail }) {
  const router = express.Router();

  router.post('/', async (req, res) => {
    try {
      const { name, email, phone, password, whatsappNumber, connectWhatsapp, role } = req.body || {};
      if (!name || !email || !phone) {
        return res.status(400).json({ ok: false, error: 'name, email, phone are required' });
      }
      if (!password || typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({ ok: false, error: 'password is required (min 8 chars)' });
      }
      if (!/^\S+@\S+\.\S+$/.test(String(email).trim())) {
        return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
      }

      const accountRole = ALLOWED_ROLES.includes(role) ? role : 'user';

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const otp = generateOtp();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

      const linkedWhatsapp = connectWhatsapp ? trimmed(whatsappNumber) || trimmed(phone) : '';

      let existing = null;
      try {
        const results = await connectStore('signups', { email: String(email).trim() });
        existing = results.length > 0 ? results[0] : null;

      } catch {
        existing = null;
      }

      if (existing) {
        if (existing.verified) {
          return res.status(409).json({ ok: false, error: 'An account with this email already exists. Please sign in.' });
        }
        await updateById('signups', existing._id, {
          $set: { name: trimmed(name), phone: trimmed(phone), whatsappNumber: linkedWhatsapp, passwordHash, role: accountRole, otp, otpExpiry }
        });

      } else {
        await createDocument('signups', {
          name: trimmed(name),
          email: String(email).trim(),
          phone: trimmed(phone),
          whatsappNumber: linkedWhatsapp,
          passwordHash,
          role: accountRole,
          otp,
          otpExpiry,
        });

      }

      try {
        await sendOtpEmail(String(email).trim(), otp);
      } catch (mailErr) {
        console.error('[Mail] OTP send failed:', mailErr?.message || mailErr);
      }

      res.json({ ok: true, message: 'Account created. Verification code sent to your email.', requiresVerification: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ ok: false, error: 'Signup failed. Please try again.' });
    }
  });

  return router;
}

export { trimmed, generateOtp };
