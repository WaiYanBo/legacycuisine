import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import webhookRoutes from './routes/webhook.routes';
import dashboardRoutes from './routes/dashboard.routes';
import productRoutes from './routes/product.routes';
import invoiceRoutes from './routes/invoice.routes';
import vendorRoutes from './routes/vendor.routes';
import formRoutes from './routes/form.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Security Hardening: Conceal Express fingerprint header
app.disable('x-powered-by');

// Security Hardening: Apply HTTP security headers via Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Security Hardening: Configured CORS origin validation
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, server-to-server calls) or matching origins
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS Policy Restriction: Origin not allowed'));
  },
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));

// Security Hardening: Rate limiting to mitigate DoS & brute-force attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again later.' }
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // Limit form submissions & webhooks to 30 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Submission limit reached, please try again later.' }
});

// Apply rate limiters
app.use('/api/', apiLimiter);
app.use('/api/forms', strictLimiter);
app.use('/api/webhooks', strictLimiter);

// Serve static storage directory
app.use('/storage', express.static(path.join(process.cwd(), 'storage')));

// Register API routes
app.use('/api/webhooks', webhookRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/products', productRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/forms', formRoutes);

// Global health check & sanitized root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Legacy Cuisine API Service',
    timestamp: new Date()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Security Hardening: Centralized Error Handler to prevent stack trace leakage in production
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Unhandled Error]', err.stack || err.message || err);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    error: isProd ? 'Internal Server Error' : (err.message || 'Server Error')
  });
});

// Boot the application
app.listen(PORT, () => {
  console.log(`[Reconciliation API] Running on port ${PORT}`);
});
