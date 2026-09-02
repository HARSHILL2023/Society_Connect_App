const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

require('./config/env');

const { CLIENT_ORIGIN } = require('./config/env');
const { errorHandler, notFound } = require('./middleware/error.middleware');

// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const ticketRoutes = require('./routes/ticket.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

/* ─── Security Middleware ─── */
app.use(helmet());

// Enable CORS for mobile apps and web tools
// FIX: CLIENT_ORIGIN="*" with credentials:true is invalid per CORS spec (browser would block * + credentials)
// For native/Expo Go there is no browser origin, but for Expo Web / dev tools we must reflect the request origin properly.
const buildCorsOrigin = () => {
  const raw = (CLIENT_ORIGIN || '').trim();
  if (!raw || raw === '*') {
    // Development / native: reflect any origin (allows exp://, 192.168.x.x, 10.0.2.2, localhost with credentials)
    return true;
  }
  const allowedList = raw.split(',').map((s) => s.trim()).filter(Boolean);
  if (allowedList.includes('*')) return true;
  return (origin, callback) => {
    // Non-browser clients (React Native, curl, mobile) send no Origin — allow
    if (!origin) return callback(null, true);
    if (allowedList.includes(origin)) return callback(null, true);
    // Expo Go / LAN convenience: allow exp:// and local network origins
    if (
      origin.startsWith('exp://') ||
      origin.startsWith('http://192.168.') ||
      origin.startsWith('http://10.0.') ||
      origin.startsWith('http://localhost:')
    ) {
      return callback(null, true);
    }
    return callback(null, false);
  };
};

app.use(
  cors({
    origin: buildCorsOrigin(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: { success: false, message: 'Too many authentication attempts, please try again in 15 minutes.' },
});

/* ─── Parsers & Sanitization ─── */
app.use(express.json({ limit: '3mb' }));
app.use(express.urlencoded({ extended: true, limit: '3mb' }));
app.use(mongoSanitize());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/* ─── Health Check ─── */
const mongoose = require('mongoose');

app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  }[dbState] || 'unknown';

  const isHealthy = dbState === 1;

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    service: 'Society Connect API',
    status: isHealthy ? 'online' : 'degraded',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      host: mongoose.connection.host || 'N/A',
      name: mongoose.connection.name || 'N/A',
    },
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

/* ─── Mount Routes ─── */
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

/* ─── Error Handlers ─── */
app.use(notFound);
app.use(errorHandler);

module.exports = app;
