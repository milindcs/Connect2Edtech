import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
const __dirname = fileURLToPath(new URL('.', import.meta.url));
dotenv.config();

const app = express();
const CORS_ORIGINS = [
  "https://connect2edtech.onrender.com",
  "http://localhost:5173",
];

app.use(
  cors({
    origin(origin, cb) {
      // allow requests with no origin (e.g. curl, mobile apps)
      if (!origin) return cb(null, true);
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

// MongoDB Models
const SignupSubmissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  passwordHash: { type: String, required: true },
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
  return `https://web.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(message)}`;
}

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

// Signup - store in MongoDB + redirect to WhatsApp
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body || {};
    if (!name || !email || !phone) {
      return res.status(400).json({ ok: false, error: 'name, email, phone are required' });
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ ok: false, error: 'password is required (min 8 chars)' });
    }

    const conn = await connectMongo();
    if (conn && mongoose.connection.readyState === 1) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      await SignupSubmission.create({ name, email, phone, passwordHash });
    }

    const msg = [`📋 New Signup Request`, `Name: ${trimmed(name) || '—'}`, `Email: ${trimmed(email) || '—'}`, `Phone: ${trimmed(phone) || '—'}`].join('\n');
    res.json({ ok: true, whatsappUrl: buildWhatsAppUrl(msg) });
  } catch (e) {
    console.error(e);
    const msg = [`📋 New Signup Request`, `Name: ${trimmed(req.body?.name) || '—'}`].join('\n');
    res.json({ ok: true, whatsappUrl: buildWhatsAppUrl(msg) });
  }
});

// Signin - verify credentials against stored SignupSubmission
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

    const msg = [`🔐 Sign In`, `Name: ${trimmed(account.name) || '—'}`, `Email: ${trimmed(account.email) || '—'}`, `Phone: ${trimmed(account.phone) || '—'}`].join('\n')
    res.json({ ok: true, whatsappUrl: buildWhatsAppUrl(msg) })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Sign in failed' })
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