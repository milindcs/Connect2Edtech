import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();


const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const WHATSAPP_PHONE = '917019436720';
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER;

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

const CertificateRequestSchema = new mongoose.Schema({
  decision: { type: String, default: '' },
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  certificate_email: { type: String, default: '' },
  cc_email: { type: String, default: '' },
  phone: { type: String, default: '' },
  certificate_type: { type: String, default: '' },
  program: { type: String, default: '' },
  student_id: { type: String, default: '' },
  year: { type: String, default: '' },
  message: { type: String, default: '' },
  requestSource: { type: String, default: '' },
  hostname: { type: String, default: '' },
  ip: { type: String, default: '' },
  mailSent: { type: Boolean, default: false },
  mailError: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
}, { minimize: false, timestamps: false, versionKey: false });
const CertificateRequest = mongoose.model('CertificateRequest', CertificateRequestSchema);

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

function getMailTransporter() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

async function sendCertificateEmail(request) {
  const transporter = getMailTransporter();
  if (!transporter) {
    throw new Error('SMTP configuration is missing');
  }

  const recipients = [request.certificate_email.trim()];
  if (request.cc_email && request.cc_email.trim()) {
    recipients.push(request.cc_email.trim());
  }

  const subject = 'Your Connect2Edtech Certificate Request';
  const plainContent = [
    'Hello from Connect2Edtech,',
    '',
    'Your certificate request has been processed. Here are the details:',
    `Decision: ${request.decision || '—'}`,
    `Name: ${request.name || '—'}`,
    `Email: ${request.email || '—'}`,
    `Certificate Delivery Email: ${request.certificate_email || '—'}`,
    request.cc_email ? `CC: ${request.cc_email}` : null,
    request.phone ? `Phone: ${request.phone}` : null,
    `Certificate Type: ${request.certificate_type || '—'}`,
    `Program: ${request.program || '—'}`,
    request.student_id ? `Student ID: ${request.student_id}` : null,
    request.year ? `Year: ${request.year}` : null,
    request.message ? `Details: ${request.message}` : null,
    '',
    'Thank you for choosing Connect2Edtech.',
  ].filter(Boolean).join('\n');

  const certContent = [
    'CONNECT2EDTECH',
    '',
    'Certificate of Completion',
    '',
    'This is to certify that',
    `${request.name || '—'}`,
    '',
    'has successfully completed',
    `${request.certificate_type || '—'}`,
    '',
    `Program: ${request.program || '—'}`,
    `Year: ${request.year || '—'}`,
    '',
    'Issued by Connect2Edtech',
    `Date: ${new Date().toISOString().slice(0, 10)}`,
  ].join('\n');

  const htmlContent = [
    '<p>Hello from Connect2Edtech,</p>',
    '<p>Your certificate request has been processed. Here are the details:</p>',
    '<ul>',
    `<li><strong>Decision:</strong> ${request.decision || '—'}</li>`,
    `<li><strong>Name:</strong> ${request.name || '—'}</li>`,
    `<li><strong>Email:</strong> ${request.email || '—'}</li>`,
    `<li><strong>Certificate Delivery Email:</strong> ${request.certificate_email || '—'}</li>`,
    request.cc_email ? `<li><strong>CC:</strong> ${request.cc_email}</li>` : '',
    request.phone ? `<li><strong>Phone:</strong> ${request.phone}</li>` : '',
    `<li><strong>Certificate Type:</strong> ${request.certificate_type || '—'}</li>`,
    `<li><strong>Program:</strong> ${request.program || '—'}</li>`,
    request.student_id ? `<li><strong>Student ID:</strong> ${request.student_id}</li>` : '',
    request.year ? `<li><strong>Year:</strong> ${request.year}</li>` : '',
    request.message ? `<li><strong>Details:</strong> ${request.message}</li>` : '',
    '</ul>',
    '<p>Thank you for choosing Connect2Edtech.</p>',
  ].filter(Boolean).join('')

  return transporter.sendMail({
    from: MAIL_FROM,
    to: request.certificate_email.trim(),
    cc: request.cc_email && request.cc_email.trim() ? request.cc_email.trim() : undefined,
    subject,
    text: plainContent,
    html: htmlContent,
    attachments: [
      {
        filename: `Certificate_${(request.name || 'Student').replace(/\s+/g, '_')}.txt`,
        content: certContent,
        contentType: 'text/plain',
      },
    ],
  });
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
    const { submissionType, name, email, phone, note, courseTitle, totalAmount } = req.body || {};

    const conn = await connectMongo();
    let existingItems = [];
    if (conn && mongoose.connection.readyState === 1) {
      existingItems = await CartItem.find({ sessionId }).sort({ addedAt: -1 });
      await CartCheckout.create({
        sessionId,
        submissionType: submissionType || 'checkout',
        name: name || '',
        email: email || '',
        phone: phone || '',
        note: note || '',
        courseTitle: courseTitle || '',
        totalAmount: typeof totalAmount === 'number' ? totalAmount : Number(totalAmount || 0),
        courses: existingItems.map((x) => ({ courseKey: x.courseKey, title: x.title, price: x.price, image: x.image })),
      });
      await CartItem.deleteMany({ sessionId });
    }

    const courseList = existingItems.map(i => i.title).join(', ') || courseTitle;
    const msg = [`🛒 Checkout Request`, `Type: ${submissionType || 'checkout'}`, `Name: ${trimmed(name) || '—'}`, `Email: ${trimmed(email) || '—'}`, `Phone: ${trimmed(phone) || '—'}`, `Courses: ${courseList || '—'}`, totalAmount ? `Total: ₹${totalAmount}` : null, note ? `Note: ${trimmed(note)}` : null].filter(Boolean).join('\n');
    res.json({ ok: true, whatsappUrl: buildWhatsAppUrl(msg) });
  } catch (e) {
    console.error(e);
    res.json({ ok: true, whatsappUrl: buildWhatsAppUrl(`🛒 Checkout Request\nName: ${trimmed(req.body?.name) || '—'}`) });
  }
});

// Certificate request - store in MongoDB + redirect to WhatsApp
app.post('/send-certificate', async (req, res) => {
  try {
    const { name, email, decision, certificate_email, cc_email, phone, certificate_type, program, student_id, year, message } = req.body || {};
    const studentName = (name || '').trim();
    const studentEmail = (email || '').trim();
    const deliveryEmail = (certificate_email || '').trim();

    if (!studentName || !studentEmail || !deliveryEmail) {
      return res.status(400).json({ ok: false, error: 'Missing required fields: name, email and certificate_email' });
    }

    const conn = await connectMongo();
    let saveRecord = null;
    if (conn && mongoose.connection.readyState === 1) {
      saveRecord = await CertificateRequest.create({
        decision: trimmed(decision), name: studentName, email: studentEmail,
        certificate_email: trimmed(deliveryEmail), cc_email: trimmed(cc_email), phone: trimmed(phone),
        certificate_type: trimmed(certificate_type), program: trimmed(program), student_id: trimmed(student_id),
        year: trimmed(year), message: trimmed(message), requestSource: 'send-certificate',
        hostname: req.hostname || '', ip: getClientIp(req),
      });
    }

    const msg = [`📜 Certificate Request`, `Decision: ${trimmed(decision) || '—'}`, `Name: ${studentName}`, `Email: ${studentEmail}`, `Delivery Email: ${trimmed(deliveryEmail) || '—'}`, cc_email ? `CC: ${trimmed(cc_email)}` : null, phone ? `Phone: ${trimmed(phone)}` : null, `Certificate Type: ${trimmed(certificate_type) || '—'}`, `Program: ${trimmed(program) || '—'}`, student_id ? `Student ID: ${trimmed(student_id)}` : null, year ? `Year: ${trimmed(year)}` : null, message ? `Details: ${trimmed(message)}` : null].filter(Boolean).join('\n');

    let mailResult = null;
    let mailError = '';
    try {
      mailResult = await sendCertificateEmail({
        decision: trimmed(decision),
        name: studentName,
        email: studentEmail,
        certificate_email: deliveryEmail,
        cc_email: trimmed(cc_email),
        phone: trimmed(phone),
        certificate_type: trimmed(certificate_type),
        program: trimmed(program),
        student_id: trimmed(student_id),
        year: trimmed(year),
        message: trimmed(message),
      });
    } catch (emailErr) {
      mailError = String(emailErr.message || emailErr);
      console.error('Certificate email failed:', emailErr);
    }

    if (saveRecord) {
      saveRecord.mailSent = Boolean(mailResult);
      saveRecord.mailError = mailError;
      await saveRecord.save();
    }

    res.json({ ok: true, whatsappUrl: buildWhatsAppUrl(msg), emailSent: Boolean(mailResult), emailError: mailError });
  } catch (err) {
    console.error(err);
    res.json({ ok: true, whatsappUrl: buildWhatsAppUrl(`📜 Certificate Request\nName: ${trimmed(req.body?.name) || '—'}`) });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    application: 'Connect2Edtech Backend',
    status: 'Running',
    version: '1.0.0'
  });
});

// 404 handler for unknown API routes
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

// Start Express server
app.listen(PORT, () => {
  console.log(`🚀 Connect2Edtech Backend running on port ${PORT}`);
});