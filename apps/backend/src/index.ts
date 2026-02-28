import express, { type Application } from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { logger } from './logger.js';

const app: Application = express();
const PORT = process.env.BACKEND_PORT || 4291;

// Middleware
app.use(
  cors({
    origin: process.env.BETTER_AUTH_URL || 'http://localhost:3847',
    credentials: true,
  })
);
app.use(express.json());

// Mount all API routes
app.use('/api', routes);

// ============================================================================
// SERVER STARTUP
// ============================================================================

app.listen(PORT, () => {
  logger.info(`\n🚀 Backend server running at http://localhost:${PORT}\n`);
  logger.info('Available API endpoints:');
  logger.info('  Auth:');
  logger.info('    POST   /api/auth/login');
  logger.info('  Sponsors:');
  logger.info('    GET    /api/sponsors');
  logger.info('    GET    /api/sponsors/:id');
  logger.info('    POST   /api/sponsors');
  logger.info('  Publishers:');
  logger.info('    GET    /api/publishers');
  logger.info('    GET    /api/publishers/:id');
  logger.info('  Campaigns:');
  logger.info('    GET    /api/campaigns');
  logger.info('    GET    /api/campaigns/:id');
  logger.info('    POST   /api/campaigns');
  logger.info('  Ad Slots:');
  logger.info('    GET    /api/ad-slots');
  logger.info('    GET    /api/ad-slots/:id');
  logger.info('    POST   /api/ad-slots');
  logger.info('  Placements:');
  logger.info('    GET    /api/placements');
  logger.info('    POST   /api/placements');
  logger.info('  Dashboard:');
  logger.info('    GET    /api/dashboard/stats');
  logger.info('  Health:');
  logger.info('    GET    /api/health');
  logger.info('');
});

export default app;
