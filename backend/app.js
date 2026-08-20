const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

require('./config/env');

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
app.use(
  cors({
    origin: '*',
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
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: true, limit: '20kb' }));
app.use(mongoSanitize());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/* ─── Health Check ─── */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    service: 'Society Connect API',
    status: 'online',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
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
