import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
const __dirname = fileURLToPath(new URL('.', import.meta.url));
dotenv.config();

const app = express();
const CORS_ORIGINS = (process.env.CORS_ORIGINS ||
  "https://connect2edtech.onrender.com,http://localhost:5173,http://localhost:10000")
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // allow requests with no origin (e.g. curl, mobile apps)
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

// Explicitly respond to preflight requests
app.options('*', cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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
    if (decoded.role !== 'admin') {
      return res.status(403).json({ ok: false, error: 'Admin access only' });
    }
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ ok: false, error: 'Invalid token' });
  }
}

// MongoDB Models
const SignupSubmissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  passwordHash: { type: String, required: true },
  verified: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  otp: { type: String, default: '' },
  otpExpiry: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
}, { versionKey: false });
SignupSubmissionSchema.index({ email: 1 }, { unique: true });
const SignupSubmission = mongoose.model('SignupSubmission', SignupSubmissionSchema);

const ContactSubmissionSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  message: { type: String, default: '' },
  courses: { type: String, default: '' },
  hostname: { type: String, default: '' },
  ip: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
}, { versionKey: false });
const ContactSubmission = mongoose.model('ContactSubmission', ContactSubmissionSchema);

const CartItemSchema = new mongoose.Schema({
  sessionId: { type: String, index: true, required: true },
  courseKey: { type: String, required: true },
  title: { type: String, default: '' },
  price: { type: Number, default: 0 },
  image: { type: String, default: '' },
  addedAt: { type: Date, default: Date.now },
}, { versionKey: false });
CartItemSchema.index({ sessionId: 1, courseKey: 1 }, { unique: true });
const CartItem = mongoose.model('CartItem', CartItemSchema);

const CartCheckoutSchema = new mongoose.Schema({
  sessionId: { type: String, index: true, required: true },
  submissionType: { type: String, enum: ['checkout', 'enrollment', 'course-enquiry'], default: 'checkout' },
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  note: { type: String, default: '' },
  courseTitle: { type: String, default: '' },
  courses: { type: [{ courseKey: String, title: String, price: Number, image: String }], default: [] },
  totalAmount: { type: Number, default: 0 },
  whatsappOpenedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
}, { versionKey: false });
const CartCheckout = mongoose.model('CartCheckout', CartCheckoutSchema);

const EnrollmentSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  college: { type: String, default: '' },
  message: { type: String, default: '' },
  courseKey: { type: String, default: '' },
  courseTitle: { type: String, default: '' },
  hostname: { type: String, default: '' },
  ip: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
}, { versionKey: false });
const Enrollment = mongoose.model('Enrollment', EnrollmentSchema);


// MongoDB Connection
let mongoConnectionPromise = null;

async function connectMongo() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (mongoConnectionPromise) return mongoConnectionPromise;

  let uri = process.env.MONGODB_URI || process.env.MONGODB_LOCAL || 'mongodb://localhost:27017/connect2edtech';
  mongoose.set('strictQuery', true);

  mongoConnectionPromise = mongoose.connect(uri, { serverSelectionTimeoutMS: 5000, socketTimeoutMS: 5000 })
    .then((m) => { console.log('[MongoDB] connected'); return m; })
    .catch((err) => { console.log('[MongoDB] connection failed:', err.message); mongoConnectionPromise = null; return null; });

  return mongoConnectionPromise;
}

function getClientIp(req) {
  return req.headers?.['x-forwarded-for']?.toString().split(',')[0]?.trim() || req.ip || '';
}

function getSessionId(req) {
  const header = req.headers['x-session-id'];
  return (typeof header === 'string' ? header.trim() : '') || req.ip;
}

const trimmed = (v) => (typeof v === 'string' ? v.trim() : '');

function buildWhatsAppUrl(message) {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

// Signup - create account, send OTP email
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body || {};
    if (!name || !email || !phone) {
      return res.status(400).json({ ok: false, error: 'name, email, phone are required' });
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ ok: false, error: 'password is required (min 8 chars)' });
    }
    if (!/^\S+@\S+\.\S+$/.test(String(email).trim())) {
      return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
    }

    const conn = await connectMongo();
    if (!conn || mongoose.connection.readyState !== 1) {
      return res.status(503).json({ ok: false, error: 'Service temporarily unavailable. Please try again later.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    let existing = null;
    try {
      existing = await SignupSubmission.findOne({ email: String(email).trim() });
    } catch {
      existing = null;
    }

    if (existing) {
      if (existing.verified) {
        return res.status(409).json({ ok: false, error: 'An account with this email already exists. Please sign in.' });
      }
      await SignupSubmission.updateOne(
        { _id: existing._id },
        { $set: { name: trimmed(name), phone: trimmed(phone), passwordHash, otp, otpExpiry } }
      );
    } else {
      await SignupSubmission.create({
        name: trimmed(name),
        email: String(email).trim(),
        phone: trimmed(phone),
        passwordHash,
        otp,
        otpExpiry,
      });
    }

    try {
      await sendOtpEmail(String(email).trim(), otp);
    } catch (mailErr) {
      console.error('[Mail] OTP send failed:', mailErr.message);
    }

    res.json({ ok: true, message: 'Account created. Verification code sent to your email.', requiresVerification: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Signup failed. Please try again.' });
  }
});

// Signin - verify credentials and return JWT
app.post('/api/signin', async (req, res) => {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'email and password are required' })
    }

    const conn = await connectMongo()
    if (!conn || mongoose.connection.readyState !== 1) {
      return res.status(503).json({ ok: false, error: 'Service temporarily unavailable. Please try again later.' })
    }

    const safe = String(email).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const account = await SignupSubmission.findOne({ email: new RegExp('^' + safe + '$', 'i') })
    if (!account) {
      return res.status(401).json({ ok: false, error: 'No account found for this email. Please sign up first.' })
    }

    const matched = await bcrypt.compare(password, account.passwordHash || '')
    if (!matched) {
      return res.status(401).json({ ok: false, error: 'Incorrect password.' })
    }

    if (!account.verified) {
      return res.status(403).json({ ok: false, error: 'Please verify your email before signing in.', requiresVerification: true })
    }

    const token = signJwt(account)
    res.json({ ok: true, token, user: { name: account.name, email: account.email, phone: account.phone, verified: account.verified, role: account.role || 'user' } })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Sign in failed' })
  }
})

// Verify OTP
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body || {}
    if (!email || !otp) {
      return res.status(400).json({ ok: false, error: 'email and otp are required' })
    }

    const conn = await connectMongo()
    if (!conn || mongoose.connection.readyState !== 1) {
      return res.status(503).json({ ok: false, error: 'Service temporarily unavailable. Please try again later.' })
    }

    const account = await SignupSubmission.findOne({ email: String(email).trim() })
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

    await SignupSubmission.updateOne({ _id: account._id }, { $set: { verified: true, otp: '', otpExpiry: null } })
    const token = signJwt({ ...account.toObject(), verified: true })
    res.json({ ok: true, message: 'Email verified successfully.', token, user: { name: account.name, email: account.email, phone: account.phone, verified: true, role: account.role || 'user' } })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Verification failed.' })
  }
})

// Resend OTP
app.post('/api/resend-otp', async (req, res) => {
  try {
    const { email } = req.body || {}
    if (!email) {
      return res.status(400).json({ ok: false, error: 'email is required' })
    }

    const conn = await connectMongo()
    if (!conn || mongoose.connection.readyState !== 1) {
      return res.status(503).json({ ok: false, error: 'Service temporarily unavailable. Please try again later.' })
    }

    const account = await SignupSubmission.findOne({ email: String(email).trim() })
    if (!account) {
      return res.status(404).json({ ok: false, error: 'Account not found.' })
    }

    if (account.verified) {
      return res.json({ ok: true, message: 'Email already verified.' })
    }

    const otp = generateOtp()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)
    await SignupSubmission.updateOne({ _id: account._id }, { $set: { otp, otpExpiry } })

    try {
      await sendOtpEmail(String(email).trim(), otp)
    } catch (mailErr) {
      console.error('[Mail] OTP resend failed:', mailErr.message)
    }

    res.json({ ok: true, message: 'New verification code sent to your email.' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Resend failed.' })
  }
})

// Get current user from token
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const conn = await connectMongo()
    if (!conn || mongoose.connection.readyState !== 1) {
      return res.status(503).json({ ok: false, error: 'Service temporarily unavailable.' })
    }

    const account = await SignupSubmission.findById(req.user.userId)
    if (!account) {
      return res.status(404).json({ ok: false, error: 'User not found.' })
    }

    res.json({ ok: true, user: { name: account.name, email: account.email, phone: account.phone, verified: account.verified, role: account.role || 'user' } })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Failed to fetch user.' })
  }
})

// Admin dashboard - list all users
app.get('/api/admin/users', adminAuth, async (req, res) => {
  try {
    const conn = await connectMongo()
    if (!conn || mongoose.connection.readyState !== 1) {
      return res.status(503).json({ ok: false, error: 'Service temporarily unavailable.' })
    }

    const users = await SignupSubmission.find({}, { name: 1, email: 1, phone: 1, verified: 1, role: 1, createdAt: 1 }).sort({ createdAt: -1 })
    res.json({ ok: true, users })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Failed to fetch users.' })
  }
})

// Contact - store in MongoDB + redirect to WhatsApp
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message, courses } = req.body || {};
    if (!name || !email) {
      return res.status(400).json({ ok: false, error: 'name and email are required' });
    }

    const conn = await connectMongo();
    if (conn && mongoose.connection.readyState === 1) {
      await ContactSubmission.create({
        name, email, phone: phone || '', message: message || '', courses: courses || '',
        hostname: req.hostname || '', ip: getClientIp(req),
      });
    }

    const msg = [`📞 Contact Inquiry`, `Name: ${trimmed(name) || '—'}`, `Email: ${trimmed(email) || '—'}`, `Phone: ${trimmed(phone) || '—'}`, `Message: ${trimmed(message) || '—'}`, courses ? `Courses: ${trimmed(courses)}` : null].filter(Boolean).join('\n');
    res.json({ ok: true, whatsappUrl: buildWhatsAppUrl(msg) });
  } catch (e) {
    console.error(e);
    res.json({ ok: true, whatsappUrl: buildWhatsAppUrl(`📞 Contact Inquiry\nName: ${trimmed(req.body?.name) || '—'}`) });
  }
});

// Enrollment - store in MongoDB + redirect to WhatsApp
app.post('/api/enrollment', async (req, res) => {
  try {
    const { name, email, phone, college, message, courseKey, courseTitle } = req.body || {};
    if (!name || !email) {
      return res.status(400).json({ ok: false, error: 'name and email are required' });
    }

    const conn = await connectMongo();
    if (conn && mongoose.connection.readyState === 1) {
      await Enrollment.create({
        name, email, phone: phone || '', college: college || '', message: message || '',
        courseKey: courseKey || '', courseTitle: courseTitle || '',
        hostname: req.hostname || '', ip: getClientIp(req),
      });
    }

    const courseLabel = courseTitle || courseKey || 'Unspecified course';
    const msg = [`🎓 New Enrollment`, `Course: ${trimmed(courseLabel) || '—'}`, `Name: ${trimmed(name) || '—'}`, `Email: ${trimmed(email) || '—'}`, `Phone: ${trimmed(phone) || '—'}`, message ? `Requirements: ${trimmed(message)}` : null].filter(Boolean).join('\n');
    res.json({ ok: true, whatsappUrl: buildWhatsAppUrl(msg) });
  } catch (e) {
    console.error(e);
    res.json({ ok: true, whatsappUrl: buildWhatsAppUrl(`🎓 New Enrollment\nName: ${trimmed(req.body?.name) || '—'}`) });
  }
});

// Cart endpoints
app.post('/api/cart/add', async (req, res) => {
  try {
    const sessionId = getSessionId(req);
    const { courseKey, title, price, image } = req.body || {};
    if (!courseKey) return res.status(400).json({ ok: false, error: 'courseKey required' });

    const conn = await connectMongo();
    const priceNum = typeof price === 'number' ? price : Number(price || 0);

    if (conn && mongoose.connection.readyState === 1) {
      await CartItem.updateOne(
        { sessionId, courseKey },
        { $set: { title: title || '', price: Number.isFinite(priceNum) ? priceNum : 0, image: image || '', addedAt: new Date() } },
        { upsert: true }
      );
      const items = await CartItem.find({ sessionId }).sort({ addedAt: -1 });
      res.json({ ok: true, items });
    } else {
      res.json({ ok: true, items: [] });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});

app.get('/api/cart', async (req, res) => {
  try {
    const sessionId = getSessionId(req);
    const conn = await connectMongo();
    if (conn && mongoose.connection.readyState === 1) {
      const items = await CartItem.find({ sessionId }).sort({ addedAt: -1 });
      res.json({ ok: true, items });
    } else {
      res.json({ ok: true, items: [] });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});

app.delete('/api/cart/:courseKey', async (req, res) => {
  try {
    const sessionId = getSessionId(req);
    const { courseKey } = req.params;
    const conn = await connectMongo();
    if (conn && mongoose.connection.readyState === 1) {
      await CartItem.deleteOne({ sessionId, courseKey });
      const items = await CartItem.find({ sessionId }).sort({ addedAt: -1 });
      res.json({ ok: true, items });
    } else {
      res.json({ ok: true, items: [] });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});

app.delete('/api/cart', async (req, res) => {
  try {
    const sessionId = getSessionId(req);
    const conn = await connectMongo();
    if (conn && mongoose.connection.readyState === 1) {
      await CartItem.deleteMany({ sessionId });
    }
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});

// Checkout - store in MongoDB + redirect to WhatsApp
app.post('/api/checkout/submit', async (req, res) => {
  try {
    const sessionId = getSessionId(req);
    const { submissionType, name, email, phone, note, courseTitle, totalAmount, clientCartSnapshot } = req.body || {};

    const conn = await connectMongo();
    let existingItems = [];
    if (conn && mongoose.connection.readyState === 1) {
      existingItems = await CartItem.find({ sessionId }).sort({ addedAt: -1 });
    }

    const snapshotCourses = Array.isArray(clientCartSnapshot) ? clientCartSnapshot : [];
    const effectiveItems = existingItems && existingItems.length ? existingItems : snapshotCourses;

    if (conn && mongoose.connection.readyState === 1) {
      await CartCheckout.create({
        sessionId,
        submissionType: submissionType || 'checkout',
        name: name || '',
        email: email || '',
        phone: phone || '',
        note: note || '',
        courseTitle: courseTitle || '',
        totalAmount: typeof totalAmount === 'number' ? totalAmount : Number(totalAmount || 0),
        courses: effectiveItems.map((x) => ({ courseKey: x.courseKey, title: x.title, price: x.price, image: x.image })),
      });

      if (existingItems && existingItems.length) {
        await CartItem.deleteMany({ sessionId });
      }
    }

    const courseList = effectiveItems.map(i => i.title).join(', ') || courseTitle;
    const msg = [`🛒 Checkout Request`, `Type: ${submissionType || 'checkout'}`, `Name: ${trimmed(name) || '—'}`, `Email: ${trimmed(email) || '—'}`, `Phone: ${trimmed(phone) || '—'}`, `Courses: ${courseList || '—'}`, totalAmount ? `Total: ₹${totalAmount}` : null, note ? `Note: ${trimmed(note)}` : null].filter(Boolean).join('\n');
    res.json({ ok: true, whatsappUrl: buildWhatsAppUrl(msg) });
  } catch (e) {
    console.error(e);
    res.json({ ok: true, whatsappUrl: buildWhatsAppUrl(`🛒 Checkout Request\nName: ${trimmed(req.body?.name) || '—'}`) });
  }
});


// Serve frontend static files after API routes
const FRONTEND_DIST = path.resolve(__dirname, '../frontend/dist');
app.use(express.static(FRONTEND_DIST));

// SPA fallback for client-side routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found' });
  }
  res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
});

// 404 handler for anything else
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

const PORT = process.env.PORT || 10000;

// Connect to MongoDB once
connectMongo().catch((err) => {
  console.error('[MongoDB]', err.message);
});

// Start Express server only in local development mode
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Connect2Edtech Backend running on port ${PORT}`);
  });
}

export default app;