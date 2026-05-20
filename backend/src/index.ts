import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import walletRouter from './routes/wallet';
import transactionsRouter from './routes/transactions';
import searchRouter from './routes/search';
import { initWebSocketServer } from './websocket/txStream';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(cors({ origin: '*' }));
app.use(express.json());

// Request timing middleware
app.use((req, _res, next) => {
  (req as any).startTime = Date.now();
  next();
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', mode: process.env.MOCK_MODE === 'true' ? 'mock' : 'live', ts: new Date().toISOString() });
});

// Routes
app.use('/api/wallet', walletRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/search', searchRouter);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const server = http.createServer(app);
initWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`\n🔗 ChainScope API running on http://localhost:${PORT}`);
  console.log(`   Mode: ${process.env.MOCK_MODE === 'true' ? 'MOCK (no RPC)' : 'LIVE'}`);
  console.log(`   WebSocket: ws://localhost:${PORT}/ws\n`);
});
