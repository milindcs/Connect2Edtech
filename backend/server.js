import express from 'express';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import dns from 'dns';
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import os from 'os';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { createSignupRouter } from './routes/signup.js';
import { createSigninRouter } from './routes/signin.js';
import { createMailRouter } from './routes/mail.js';
import { createCartRouter } from './routes/cart.js';
import { createCheckoutRouter } from './routes/checkout.js';
import { createDocument, findOne, updateById, find, countDocuments, clearCollection, deleteOne, getDb } from './store.js';

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

// Mongo-backed store functions are async; this server uses them as async where needed.


const __dirname = fileURLToPath(new URL('.', import.meta.url));
dotenv.config();

const MONGO_HOST = (process.env.MONGODB_URI || '').includes('mongodb+srv')
  ? (process.env.MONGODB_URI.match(/mongodb\+srv:\/\/[^@/]+\@([^\/\?]+)/) || [])[1]
  : '';

async function ensureWorkingDns() {
  const configured = (process.env.DNS_SERVERS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const candidates = [
    ...configured,
    '192.168.29.1',
    '8.8.8.8',
    '1.1.1.1',
  ];
  const target = MONGO_HOST ? `_mongodb._tcp.${MONGO_HOST}` : 'cluster0.nyefwik.mongodb.net';
  try {
    await dns.promises.resolveSrv(target);
    return;
  } catch {
  }
  for (const server of candidates) {
    try {
      dns.setServers([server]);
      await dns.promises.resolveSrv(target);
      console.log(`🔧 Using DNS server ${server} (system default was unreachable)`);
      return;
    } catch {
    }
  }
}

const app = express();
const CORS_ORIGINS = (process.env.CORS_ORIGINS ||
  "https://connect2edtech.onrender.com,http://localhost:5173,http://localhost:10000")
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (CORS_ORIGINS.includes('*')) return cb(null, true);
      if (CORS_ORIGINS.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  })
);

app.options('{*splat}', cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const distDir = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}

const WHATSAPP_PHONE = '917019436720';

const JWT_SECRET = process.env.JWT_SECRET || 'connect2edtech-jwt-secret-change-in-production';
const JWT_EXPIRY = '7d';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

async function sendOtpEmail(toEmail, otp) {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@connect2edtech.com';
  await transporter.sendMail({
    from,
    to: toEmail,
    subject: 'Verify your email - Connect2Edtech',
    text: `Your verification code is ${otp}. It expires in 10 minutes.`,
    html: `<p>Your verification code is <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p>`,
  });
}

async function sendEmail({ to, subject, text, html, replyTo }) {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@connect2edtech.com';
  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
    ...(replyTo ? { replyTo } : {}),
  });
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function signJwt(user) {
  return jwt.sign(
    { userId: user._id.toString(), email: user.email, name: user.name, phone: user.phone, verified: user.verified, role: user.role || 'user' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return res.status(401).json({ ok: false, error: 'Missing token' });
  try {
    const decoded = jwt.verify(match[1], JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ ok: false, error: 'Invalid or expired token' });
  }
}

function adminAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return res.status(401).json({ ok: false, error: 'Access denied' });
  try {
    const decoded = jwt.verify(match[1], JWT_SECRET);
    if (decoded.role !== 'admin' && decoded.role !== 'hr') {
      return res.status(403).json({ ok: false, error: 'Admin access only' });
    }
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ ok: false, error: 'Invalid token' });
  }
}

function staffAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return res.status(401).json({ ok: false, error: 'Access denied' });
  try {
    const decoded = jwt.verify(match[1], JWT_SECRET);
    if (decoded.role !== 'admin' && decoded.role !== 'hr') {
      return res.status(403).json({ ok: false, error: 'Staff access only' });
    }
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ ok: false, error: 'Invalid token' });
  }
}

app.post('/api/admin/bootstrap', async (req, res) => {
  try {
    const secret = process.env.ADMIN_BOOTSTRAP_SECRET
    if (!secret) {
      return res.status(403).json({ ok: false, error: 'Bootstrap is disabled.' })
    }
    const { secret: providedSecret, email, name, phone, password } = req.body || {}
    if (providedSecret !== secret) {
      return res.status(403).json({ ok: false, error: 'Invalid secret.' })
    }
    if (!email) {
      return res.status(400).json({ ok: false, error: 'email is required.' })
    }

    const cleanEmail = String(email).trim()
    const existing = await findOne('signups', { email: cleanEmail })
    if (existing) {
      await updateById('signups', existing._id, { $set: { role: 'admin', verified: true } })
      return res.json({ ok: true, message: `Promoted ${cleanEmail} to admin.`, created: false })
    }

    if (!password) {
      return res.status(400).json({ ok: false, error: 'password is required to create a new admin.' })
    }
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)
    await createDocument('signups', {
      name: name ? String(name).trim() : 'Admin',
      email: cleanEmail,
      phone: phone ? String(phone).trim() : '0000000000',
      passwordHash,
      role: 'admin',
      verified: true,
    })
    return res.json({ ok: true, message: `Created admin ${cleanEmail}.`, created: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Bootstrap failed.' })
  }
})

function getClientIp(req) {
  return req.headers?.['x-forwarded-for']?.toString().split(',')[0]?.trim() || req.ip || '';
}

function getSessionId(req) {
  const header = req.headers['x-session-id'];
  return (typeof header === 'string' ? header.trim() : '') || req.ip;
}

const trimmed = (v) => (typeof v === 'string' ? v.trim() : '');

function buildWhatsAppUrl(message) {
  return `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(message)}`;
}

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth/signup', createSignupRouter({ connectStore: find, createDocument, updateById, sendOtpEmail }))

app.use('/api/auth/signin', createSigninRouter({ findOne, signJwt }))

app.post('/api/auth/google', async (req, res) => {
  try {
    const { idToken } = req.body || {}
    if (!idToken) {
      return res.status(400).json({ ok: false, error: 'Google ID token is required' })
    }

    if (!GOOGLE_CLIENT_ID) {
      return res.status(500).json({ ok: false, error: 'Google OAuth is not configured on the server' })
    }

    const tokenRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`)
    if (!tokenRes.ok) {
      return res.status(401).json({ ok: false, error: 'Invalid Google token' })
    }

    const tokenData = await tokenRes.json()
    if (tokenData.aud !== GOOGLE_CLIENT_ID) {
      return res.status(401).json({ ok: false, error: 'Invalid token audience' })
    }
    const googleEmail = String(tokenData.email || '').trim().toLowerCase()
    const googleName = String(tokenData.name || tokenData.given_name || '').trim()
    const googlePicture = String(tokenData.picture || '').trim()

    if (!googleEmail) {
      return res.status(400).json({ ok: false, error: 'Google account has no email' })
    }

    let account = await findOne('signups', { email: googleEmail })

    if (!account) {
      const randomPassword = Math.random().toString(36).slice(2) + Date.now().toString(36)
      const salt = await bcrypt.genSalt(10)
      const passwordHash = await bcrypt.hash(randomPassword, salt)

      account = await createDocument('signups', {
        name: googleName || googleEmail.split('@')[0],
        email: googleEmail,
        phone: '',
        whatsappNumber: '',
        passwordHash,
        role: 'user',
        verified: true,
        googleId: tokenData.sub,
        picture: googlePicture,
      })
    } else {
      const updates = {}
      if (!account.googleId) updates.googleId = tokenData.sub
      if (!account.picture && googlePicture) updates.picture = googlePicture
      if (Object.keys(updates).length > 0) {
        await updateById('signups', account._id, { $set: updates })
      }
    }

    const token = signJwt(account)
    res.json({
      ok: true,
      token,
      user: {
        name: account.name,
        email: account.email,
        phone: account.phone,
        whatsappNumber: account.whatsappNumber || '',
        verified: account.verified,
        role: account.role || 'user',
        picture: account.picture || googlePicture,
      },
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Google authentication failed' })
  }
})

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body || {}
    if (!email || !otp) {
      return res.status(400).json({ ok: false, error: 'email and otp are required' })
    }

    const account = await findOne('signups', { email: String(email).trim() })
    if (!account) {
      return res.status(404).json({ ok: false, error: 'Account not found.' })
    }

    if (account.verified) {
      return res.json({ ok: true, message: 'Email already verified.', verified: true })
    }

    if (!account.otp || !account.otpExpiry || new Date() > new Date(account.otpExpiry)) {
      return res.status(400).json({ ok: false, error: 'OTP expired. Please request a new one.' })
    }

    if (account.otp !== String(otp).trim()) {
      return res.status(400).json({ ok: false, error: 'Invalid OTP.' })
    }

    await updateById('signups', account._id, { verified: true, otp: '', otpExpiry: null })
    const token = signJwt({ ...account, verified: true })
    res.json({ ok: true, message: 'Email verified successfully.', token, user: { name: account.name, email: account.email, phone: account.phone, whatsappNumber: account.whatsappNumber || '', verified: true, role: account.role || 'user' } })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Verification failed.' })
  }
})

app.post('/api/auth/resend-otp', async (req, res) => {
  try {
    const { email } = req.body || {}
    if (!email) {
      return res.status(400).json({ ok: false, error: 'email is required' })
    }

    const account = await findOne('signups', { email: String(email).trim() })
    if (!account) {
      return res.status(404).json({ ok: false, error: 'Account not found.' })
    }

    if (account.verified) {
      return res.json({ ok: true, message: 'Email already verified.' })
    }

    const otp = generateOtp()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)
    await updateById('signups', account._id, { otp, otpExpiry })

    try {
      await sendOtpEmail(String(email).trim(), otp)
    } catch (mailErr) {
      console.error('[Mail] OTP resend failed:', mailErr.message)
    }

    res.json({
      ok: true,
      message: 'New verification code sent to your email.',
      ...(process.env.NODE_ENV === 'production' ? {} : { devOtp: otp }),
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Resend failed.' })
  }
})

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const account = await findOne('signups', { _id: req.user.userId })
    if (!account) {
      return res.status(404).json({ ok: false, error: 'User not found.' })
    }

    res.json({ ok: true, user: { name: account.name, email: account.email, phone: account.phone, whatsappNumber: account.whatsappNumber || '', verified: account.verified, role: account.role || 'user' } })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Failed to fetch user.' })
  }
})

app.get('/api/me/enrollments', authMiddleware, async (req, res) => {
  try {
    const items = await find('enrollments', { email: req.user.email }, { sort: { createdAt: -1 } })
    res.json({ ok: true, enrollments: items })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Failed to fetch enrollments.' })
  }
})

app.get('/api/me/contacts', authMiddleware, async (req, res) => {
  try {
    const items = await find('contacts', { email: req.user.email }, { sort: { createdAt: -1 } })
    res.json({ ok: true, contacts: items })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Failed to fetch messages.' })
  }
})

app.post('/api/enrollment', async (req, res) => {
  try {
    const { name, email, phone, college, courseKey, courseTitle, message } = req.body || {};
    if (!name || !email || !phone) {
      return res.status(400).json({ ok: false, error: 'name, email, and phone are required' });
    }
    if (!/^\S+@\S+\.\S+$/.test(String(email).trim())) {
      return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
    }

    const enrollment = await createDocument('enrollments', {
      name: trimmed(name),
      email: String(email).trim(),
      phone: trimmed(phone),
      college: trimmed(college || ''),
      courseKey: courseKey || '',
      courseTitle: courseTitle || '',
      message: message || '',
    });

    res.json({ ok: true, message: 'Enrollment received.', enrollment });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Enrollment failed. Please try again.' });
  }
})

app.get('/api/admin/users', adminAuth, async (req, res) => {
  try {
    const users = await find('signups', {}, { sort: { createdAt: -1 } })
    res.json({ ok: true, users: users.map(({ passwordHash, otp, otpExpiry, ...u }) => u) })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Failed to fetch users.' })
  }
})

app.patch('/api/admin/users/:id/role', adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.body || {}
    if (!['user', 'admin', 'hr'].includes(role)) {
      return res.status(400).json({ ok: false, error: 'Invalid role. Use "user", "admin", or "hr".' })
    }

    const account = await findOne('signups', { _id: id })
    if (!account) {
      return res.status(404).json({ ok: false, error: 'User not found.' })
    }

    const isAdmin = account.role === 'admin' || account.role === 'hr'
    if (account._id.toString() === req.admin.userId && !isAdmin) {
      return res.status(400).json({ ok: false, error: 'You cannot remove your own admin/HR role.' })
    }

    await updateById('signups', id, { role })
    res.json({ ok: true, message: `Role updated to ${role}.`, user: { id: account._id.toString(), role } })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Failed to update role.' })
  }
})

app.get('/api/admin/stats', staffAuth, async (req, res) => {
  try {
    const totalUsers = await countDocuments('signups')
    const verifiedUsers = await countDocuments('signups', { verified: true })
    const admins = await countDocuments('signups', { role: 'admin' })
    const hrs = await countDocuments('signups', { role: 'hr' })
    const enrollments = await countDocuments('enrollments')
    const contacts = await countDocuments('contacts')
    const recentEnroll = await find('enrollments', {}, { sort: { createdAt: -1 } })

    res.json({
      ok: true,
      stats: { totalUsers, verifiedUsers, admins, hrs, enrollments, contacts },
      recentEnrollments: recentEnroll,
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Failed to load stats.' })
  }
})

app.get('/api/admin/contacts', staffAuth, async (req, res) => {
  try {
    const items = await find('contacts', {}, { sort: { createdAt: -1 } })
    res.json({ ok: true, contacts: items })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Failed to fetch contacts.' })
  }
})

app.get('/api/admin/enrollments', staffAuth, async (req, res) => {
  try {
    const items = await find('enrollments', {}, { sort: { createdAt: -1 } })
    res.json({ ok: true, enrollments: items })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Failed to fetch enrollments.' })
  }
})

app.get('/api/admin/email-status', adminAuth, async (req, res) => {
  try {
    res.json({
      ok: true,
      status: {
        smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
        smtpPort: Number(process.env.SMTP_PORT || 587),
        smtpUser: process.env.SMTP_USER || '',
        smtpFrom: process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@connect2edtech.com',
      }
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Failed to fetch email status.' })
  }
})

app.post('/api/admin/test-email', adminAuth, async (req, res) => {
  try {
    const { to } = req.body || {}
    const recipient = String(to || process.env.SMTP_USER || '').trim()
    if (!recipient) {
      return res.status(400).json({ ok: false, error: 'Recipient email is required.' })
    }

    const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@connect2edtech.com'
    await sendEmail({
      to: recipient,
      subject: 'Connect2Edtech - Test Email',
      text: 'This is a test email from Connect2Edtech. If you received this, your Gmail/SMTP connection is working.',
      html: '<p>This is a test email from <strong>Connect2Edtech</strong>. If you received this, your Gmail/SMTP connection is working.</p>',
    })

    res.json({ ok: true, message: `Test email sent to ${recipient}` })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Failed to send test email.' })
  }
})

app.use('/api/mail', authMiddleware, createMailRouter({ find, findOne, updateById, sendEmail }))

app.use('/api/cart', createCartRouter({ find, createDocument, updateById, deleteOne }))

app.use('/api/checkout', createCheckoutRouter({ find, createDocument, updateById, deleteOne }))

app.get('/api/certificates/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ ok: false, error: 'Certificate id is required.' });
    }
    const cert = await findOne('certificaterequests', { certificateId: String(id).trim() });
    if (!cert) {
      return res.status(404).json({ ok: false, error: 'Certificate not found.' });
    }
    const safe = {
      _id: cert._id,
      userId: cert.userId,
      userName: cert.userName,
      userEmail: cert.userEmail,
      courseKey: cert.courseKey,
      courseTitle: cert.courseTitle,
      status: cert.status,
      issuedAt: cert.issuedAt,
      certificateId: cert.certificateId,
      createdAt: cert.createdAt,
    };
    res.json({ ok: true, ...safe });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Verification failed.' });
  }
})

if (fs.existsSync(distDir) && process.env.VERCEL !== '1') {
  app.get('/{*splat}', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

const PORT = process.env.PORT || 10000;

async function startServer() {
  try {
    await ensureWorkingDns();
    // Test MongoDB connection on startup
    const db = await getDb();
    console.log('✅ MongoDB connected successfully');
    
    if (process.env.VERCEL !== '1') {
      app.listen(PORT, () => {
        console.log(`🚀 Connect2Edtech Backend running on port ${PORT}`);
      });
    }
  } catch (e) {
    console.error('❌ Failed to connect to MongoDB:', e.message);
    console.error('Server will continue but database operations will fail.');
    
    if (process.env.VERCEL !== '1') {
      app.listen(PORT, () => {
        console.log(`🚀 Connect2Edtech Backend running on port ${PORT} (without DB)`);
      });
    }
  }
}

startServer();

export default app;
