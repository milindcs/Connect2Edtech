import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import enrollmentRoutes from './routes/enrollments.js';
import contactRoutes from './routes/contacts.js';
import courseRoutes from './routes/courses.js';

dotenv.config();

const app = express();

// Parse CORS_ORIGINS from environment (comma-separated)
const CORS_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'];

// CORS Configuration
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || CORS_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  })
);

// Body Parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Health Check
app.get('/health', (req, res) => {
  const mongoReady = mongoose.connection.readyState === 1;
  res.json({
    ok: true,
    name: 'Connect2EdTech API',
    status: 'Running',
    mongodb: mongoReady ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/courses', courseRoutes);

// Root Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    application: 'Connect2EdTech Backend',
    status: 'Running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      courses: '/api/courses',
      enrollments: '/api/enrollments',
      contacts: '/api/contacts',
    },
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    ok: false,
    error: err.message || 'Internal server error',
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    ok: false,
    error: 'API endpoint not found',
  });
});

// MongoDB Connection
let mongoConnectionPromise = null;

function maskSensitiveUri(uri) {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
}

async function connectMongo() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (mongoConnectionPromise) {
    return mongoConnectionPromise;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/connect2future';

  console.log('[MongoDB] Attempting connection...');
  console.log('[MongoDB] URI:', maskSensitiveUri(uri));

  mongoose.set('strictQuery', true);

  mongoConnectionPromise = mongoose
    .connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
    })
    .then(() => {
      console.log('[MongoDB] Connected successfully');
      console.log('  Database:', mongoose.connection.name);
      console.log('  Host:', mongoose.connection.host);
      return mongoose.connection;
    })
    .catch((err) => {
      console.error('[MongoDB] Connection failed:', err.message);
      console.error('[MongoDB] Hints:');
      console.error('  - Verify MONGODB_URI in backend/.env');
      console.error('  - Ensure your IP is whitelisted in MongoDB Atlas Network Access');
      console.error('  - Confirm the database user exists and password is correct');
      console.error('  - Check if the Atlas cluster is paused/resumed');
      mongoConnectionPromise = null;
      return null;
    });

  return mongoConnectionPromise;
}

// Initialize MongoDB connection at startup
const PORT = process.env.PORT || 10000;

async function startServer() {
  await connectMongo();

  if (process.env.VERCEL !== 'true') {
    app.listen(PORT, () => {
      console.log(`🚀 Connect2EdTech Backend running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      if (mongoose.connection.readyState !== 1) {
        console.warn('⚠️  MongoDB is not connected. Enrollment and contact features may not work.');
      }
    });
  }
}

startServer();

export default app;