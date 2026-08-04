import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import webhookRoutes from './routes/webhook.routes';
import dashboardRoutes from './routes/dashboard.routes';
import productRoutes from './routes/product.routes';
import invoiceRoutes from './routes/invoice.routes';
import vendorRoutes from './routes/vendor.routes';
import formRoutes from './routes/form.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and body parsing middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static storage directory
app.use('/storage', express.static(path.join(process.cwd(), 'storage')));

// Register API routes
app.use('/api/webhooks', webhookRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/products', productRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/forms', formRoutes);


// Global health check & root endpoints
app.get('/', (req, res) => {
  res.json({
    name: 'Legacy Cuisine Reconciliation API',
    status: 'online',
    health: '/health',
    endpoints: {
      dashboard: '/api/dashboard',
      invoices: '/api/invoices',
      products: '/api/products',
      vendors: '/api/vendors',
      webhooks: '/api/webhooks'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Boot the application
app.listen(PORT, () => {
  console.log(`[Reconciliation API] Running on port ${PORT}`);
});
