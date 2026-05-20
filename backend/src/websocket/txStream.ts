import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { generateLiveTx } from '../services/mockEthers';

interface ExtWebSocket extends WebSocket {
  isAlive: boolean;
}

export function initWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  // Heartbeat
  const heartbeat = setInterval(() => {
    wss.clients.forEach((ws) => {
      const extWs = ws as ExtWebSocket;
      if (!extWs.isAlive) return extWs.terminate();
      extWs.isAlive = false;
      extWs.ping();
    });
  }, 30000);

  wss.on('connection', (ws: WebSocket) => {
    const extWs = ws as ExtWebSocket;
    extWs.isAlive = true;

    console.log(`[WS] Client connected. Total: ${wss.clients.size}`);

    // Send welcome
    extWs.send(JSON.stringify({
      type: 'connected',
      message: 'ChainScope live feed connected',
      timestamp: new Date().toISOString(),
    }));

    extWs.on('pong', () => { extWs.isAlive = true; });

    extWs.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'ping') {
          extWs.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        }
      } catch {}
    });

    extWs.on('close', () => {
      console.log(`[WS] Client disconnected. Total: ${wss.clients.size}`);
    });
  });

  wss.on('close', () => clearInterval(heartbeat));

  // Broadcast new transactions every 2–4 seconds
  function broadcastNextTx() {
    const delay = 2000 + Math.random() * 2000;
    setTimeout(() => {
      if (wss.clients.size > 0) {
        const tx = generateLiveTx();
        const payload = JSON.stringify({ type: 'transaction', data: tx });
        wss.clients.forEach((ws) => {
          if (ws.readyState === WebSocket.OPEN) ws.send(payload);
        });
      }
      broadcastNextTx();
    }, delay);
  }

  broadcastNextTx();

  console.log('[WS] WebSocket server initialized on /ws');
  return wss;
}
