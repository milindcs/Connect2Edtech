import express from 'express';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { createSignupRouter } from './routes/signup.js';
import { createSigninRouter } from './routes/signin.js';
import { createMailRouter } from './routes/mail.js';
import { createDocument, findOne, updateById, find, countDocuments, clearCollection, getDb } from './store.js';

// Mongo-backed store functions are async; this server uses them as async where needed.


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
    if (decoded.role !== 'admin') {
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
  return `https://web.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(message)}`;
}

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/signup', createSignupRouter({ connectStore: find, createDocument, updateById, sendOtpEmail }))

app.use('/api/signin', createSigninRouter({ findOne, signJwt }))

app.post('/api/verify-otp', async (req, res) => {
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

app.post('/api/resend-otp', async (req, res) => {
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

    res.json({ ok: true, message: 'New verification code sent to your email.' })
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

app.get('/api/me/checkouts', authMiddleware, async (req, res) => {
  try {
    const items = await find('checkouts', { email: req.user.email }, { sort: { createdAt: -1 } })
    res.json({ ok: true, checkouts: items })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Failed to fetch orders.' })
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
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ ok: false, error: 'Invalid role. Use "user" or "admin".' })
    }

    const account = await findOne('signups', { _id: id })
    if (!account) {
      return res.status(404).json({ ok: false, error: 'User not found.' })
    }

    if (account._id.toString() === req.admin.userId && role !== 'admin') {
      return res.status(400).json({ ok: false, error: 'You cannot remove your own admin role.' })
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
    const enrollments = await countDocuments('enrollments')
    const contacts = await countDocuments('contacts')
    const checkouts = await countDocuments('checkouts')
    const recentEnroll = await find('enrollments', {}, { sort: { createdAt: -1 } })
    const recentCheckout = await find('checkouts', {}, { sort: { createdAt: -1 } })

    const checkoutsList = await find('checkouts')
    const revenue = checkoutsList.reduce((sum, c) => sum + (typeof c.totalAmount === 'number' ? c.totalAmount : 0), 0)

    res.json({
      ok: true,
      stats: { totalUsers, verifiedUsers, admins, enrollments, contacts, checkouts, revenue },
      recentEnrollments: recentEnroll,
      recentCheckouts: recentCheckout,
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

app.get('/api/admin/checkouts', staffAuth, async (req, res) => {
  try {
    const items = await find('checkouts', {}, { sort: { createdAt: -1 } })
    res.json({ ok: true, checkouts: items })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, error: 'Failed to fetch checkouts.' })
  }
})

app.use('/api/mail', staffAuth, createMailRouter({ findOne, updateById, sendEmail }))

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message, courses } = req.body || {};
    if (!name || !email) {
      return res.status(400).json({ ok: false, error: 'name and email are required' });
    }

      await createDocument('contacts', {
      name, email, phone: phone || '', message: message || '', courses: courses || '',
      hostname: req.hostname || '', ip: getClientIp(req),
    });

    const msg = [`📞 Contact Inquiry`, `Name: ${trimmed(name) || '—'}`, `Email: ${trimmed(email) || '—'}`, `Phone: ${trimmed(phone) || '—'}`, `Message: ${trimmed(message) || '—'}`, courses ? `Courses: ${trimmed(courses)}` : null].filter(Boolean).join('\n');
    res.json({ ok: true, whatsappUrl: buildWhatsAppUrl(msg) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Failed to submit contact form.' });
  }
});

app.post('/api/enrollment', async (req, res) => {
  try {
    const { name, email, phone, college, message, courseKey, courseTitle } = req.body || {};
    if (!name || !email) {
      return res.status(400).json({ ok: false, error: 'name and email are required' });
    }

    await createDocument('enrollments', {
      name, email, phone: phone || '', college: college || '', message: message || '',
      courseKey: courseKey || '', courseTitle: courseTitle || '',
      hostname: req.hostname || '', ip: getClientIp(req),
    });

    const courseLabel = courseTitle || courseKey || 'Unspecified course';
    const msg = [`🎓 New Enrollment`, `Course: ${trimmed(courseLabel) || '—'}`, `Name: ${trimmed(name) || '—'}`, `Email: ${trimmed(email) || '—'}`, `Phone: ${trimmed(phone) || '—'}`, message ? `Requirements: ${trimmed(message)}` : null].filter(Boolean).join('\n');
    res.json({ ok: true, whatsappUrl: buildWhatsAppUrl(msg) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Failed to submit enrollment.' });
  }
});

app.post('/api/cart/add', async (req, res) => {
  try {
    const sessionId = getSessionId(req);
    const { courseKey, title, price, image } = req.body || {};
    if (!courseKey) return res.status(400).json({ ok: false, error: 'courseKey required' });

    const existing = await find('cart', { sessionId, courseKey })
    const priceNum = typeof price === 'number' ? price : Number(price || 0);

    if (existing.length > 0) {
      await updateById('cart', existing[0]._id, {
        title: title || '', price: Number.isFinite(priceNum) ? priceNum : 0, image: image || '', addedAt: new Date()
      })
    } else {
      await createDocument('cart', {
        sessionId, courseKey, title: title || '', price: Number.isFinite(priceNum) ? priceNum : 0, image: image || '', addedAt: new Date()
      })
    }

    const items = await find('cart', { sessionId }, { sort: { addedAt: -1 } })
    res.json({ ok: true, items });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});

app.get('/api/cart', async (req, res) => {
  try {
    const sessionId = getSessionId(req);
    const items = await find('cart', { sessionId }, { sort: { addedAt: -1 } })
    res.json({ ok: true, items });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});

app.delete('/api/cart/:courseKey', async (req, res) => {
  try {
    const sessionId = getSessionId(req);
    const { courseKey } = req.params;
    const existing = await find('cart', { sessionId, courseKey })
    if (existing.length > 0) {
      const cart = await find('cart')
      const idx = cart.findIndex((doc) => doc._id === existing[0]._id)
      if (idx !== -1) {
        cart.splice(idx, 1)
      }
    }
    const items = await find('cart', { sessionId }, { sort: { addedAt: -1 } })
    res.json({ ok: true, items });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});

app.delete('/api/cart', async (req, res) => {
  try {
    const sessionId = getSessionId(req);
    const existing = await find('cart', { sessionId })
    const cartItems = await find('cart')
    existing.forEach((doc) => {
      const idx = cartItems.findIndex((d) => d._id === doc._id)
      if (idx !== -1) cartItems.splice(idx, 1)
    })
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});

app.post('/api/checkout/submit', async (req, res) => {
  try {
    const sessionId = getSessionId(req);
    const { submissionType, name, email, phone, note, courseTitle, totalAmount, clientCartSnapshot } = req.body || {};

    const existingItems = await find('cart', { sessionId }, { sort: { addedAt: -1 } })
    const snapshotCourses = Array.isArray(clientCartSnapshot) ? clientCartSnapshot : [];
    const effectiveItems = existingItems && existingItems.length ? existingItems : snapshotCourses;

    await createDocument('checkouts', {
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
      const cartItems = await find('cart')
      existingItems.forEach((doc) => {
        const idx = cartItems.findIndex((d) => d._id === doc._id)
        if (idx !== -1) cartItems.splice(idx, 1)
      })
    }

    const courseList = effectiveItems.map(i => i.title).join(', ') || courseTitle;
    const msg = [`🛒 Checkout Request`, `Type: ${submissionType || 'checkout'}`, `Name: ${trimmed(name) || '—'}`, `Email: ${trimmed(email) || '—'}`, `Phone: ${trimmed(phone) || '—'}`, `Courses: ${courseList || '—'}`, totalAmount ? `Total: ₹${totalAmount}` : null, note ? `Note: ${trimmed(note)}` : null].filter(Boolean).join('\n');
    res.json({ ok: true, whatsappUrl: buildWhatsAppUrl(msg) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Failed to submit checkout.' });
  }
});

const FRONTEND_DIST = path.resolve(__dirname, '../frontend/dist');
app.use(express.static(FRONTEND_DIST));

app.get('{*splat}', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found' });
  }
  if (path.extname(req.path)) {
    return res.status(404).send('Not found');
  }
  res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

const PORT = process.env.PORT || 10000;

async function startServer() {
  try {
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
