import express, { type Application } from 'express';
import cors from 'cors';
import routes from './routes/index.js';

const app: Application = express();

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

export default app;
