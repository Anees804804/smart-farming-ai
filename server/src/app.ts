import express from 'express';
import helmet from 'helmet';
import { corsMiddleware } from './middleware/cors';
import { generalLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import healthRoutes from './routes/healthRoutes';
import weedRoutes from './routes/weedRoutes';
import weatherRoutes from './routes/weatherRoutes';
import assistantRoutes from './routes/assistantRoutes';
import diseaseRoutes from './routes/diseaseRoutes';
import mandiPricesRoutes from './routes/mandiPricesRoutes';
import farmerRateRoutes from './routes/farmerRateRoutes';
import newsRoutes from './routes/newsRoutes';

const app = express();

// Security middleware
app.use(helmet());
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting (disabled in test)
if (process.env.NODE_ENV !== 'test') {
  app.use('/api/', generalLimiter);
}

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/weeds', weedRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/disease', diseaseRoutes);
app.use('/api/mandi-prices', mandiPricesRoutes);
app.use('/api/farmer-rates', farmerRateRoutes);
app.use('/api/news', newsRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// Global error handler
app.use(errorHandler);

export default app;
