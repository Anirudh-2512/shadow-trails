import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import trailRoutes from './routes/trails.js';
import http from 'node:http';
import { initSocket } from './socket/index.js';
import { setBroadcast } from './socket/bus.js';
import { startTrailCleanup } from './jobs/cleanup.js';

const app = express();
app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan('tiny'));

app.use(
  '/api/auth',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false })
);
app.use('/api/upload', rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/trails', trailRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: status === 500 ? 'Internal server error' : err.message });
});

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = initSocket(server);
startTrailCleanup();
setBroadcast(io.broadcastTrail);
server.listen(PORT, () => {
  console.log(`Shadow Trails API listening on http://localhost:${PORT}`);
});
