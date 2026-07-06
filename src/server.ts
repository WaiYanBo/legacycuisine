import express from 'express';
import dotenv from 'dotenv';
import webhookRoutes from './routes/webhook.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing middleware
app.use(express.json());

// Register API Webhook routes
app.use('/api/webhooks', webhookRoutes);

// Global health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Boot the application
app.listen(PORT, () => {
  console.log(`[Reconciliation API] Running on port ${PORT}`);
});
