import http from 'node:http';
import { WebSocketServer } from 'ws';
import { initWS } from './ws.js';
import app from './app.js';

const PORT = 3000;

const server = http.createServer(app);
initWS(server);

server.listen(PORT);