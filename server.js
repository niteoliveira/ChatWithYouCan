import http from 'http';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const localIp = getLocalIp();

// In-memory packet history and active client tracking
const packetHistory = [];
const clients = new Map();

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/api/info') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      localIp,
      port: PORT,
      clientCount: clients.size,
      totalPackets: packetHistory.length
    }));
    return;
  }

  // Serve static dist folder if it exists
  const distDir = path.join(__dirname, 'dist');
  if (fs.existsSync(distDir)) {
    let filePath = path.join(distDir, req.url === '/' ? 'index.html' : req.url);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(distDir, 'index.html');
    }
    
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml'
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(`CriptoLab Server ativo em http://${localIp}:${PORT}. Use npm run dev para o frontend.`);
});

const wss = new WebSocketServer({ server });

function broadcast(payload, excludeWs = null) {
  const data = JSON.stringify(payload);
  wss.clients.forEach(client => {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

wss.on('connection', (ws, req) => {
  const clientId = 'peer_' + Math.random().toString(36).substring(2, 8);
  const clientIp = req.socket.remoteAddress?.replace('::ffff:', '') || 'desconhecido';
  
  clients.set(ws, { id: clientId, ip: clientIp, joinedAt: Date.now() });

  // Send welcome & existing history to newly joined peer
  ws.send(JSON.stringify({
    type: 'SYSTEM_WELCOME',
    clientId,
    clientIp,
    serverIp: localIp,
    history: packetHistory.slice(-50),
    activeUsers: clients.size
  }));

  // Announce peer join
  broadcast({
    type: 'PEER_JOINED',
    clientId,
    clientIp,
    activeUsers: clients.size
  }, ws);

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      if (msg.type === 'CHAT_PACKET') {
        const packet = {
          id: 'pkt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          senderId: clientId,
          senderName: msg.senderName || clientId,
          cipherType: msg.cipherType,
          ciphertext: msg.ciphertext,
          metadata: msg.metadata || {},
          timestamp: Date.now()
        };

        packetHistory.push(packet);
        if (packetHistory.length > 200) {
          packetHistory.shift();
        }

        // Broadcast to everyone including sender
        broadcast({
          type: 'NEW_PACKET',
          packet
        });
      } else if (msg.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
      }
    } catch (err) {
      console.error('Falha ao processar mensagem WS:', err.message);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    broadcast({
      type: 'PEER_LEFT',
      clientId,
      activeUsers: clients.size
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🚀 CriptoLab & CriptoChat Backend iniciado com sucesso!`);
  console.log(`📡 Acesso Local: http://localhost:${PORT}`);
  console.log(`🌐 Acesso LAN:   http://${localIp}:${PORT}`);
  console.log(`🔌 WebSocket:    ws://${localIp}:${PORT}`);
  console.log(`======================================================\n`);
});
