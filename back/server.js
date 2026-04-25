import http from 'node:http';
import os from 'node:os';
import { initWS } from './ws.js';
import app from './app.js';

const PORT = 3000;

const server = http.createServer(app);
initWS(server);

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on: http://${getServerIP()}:${PORT}`);
});

function getServerIP() {
    return Object.values(os.networkInterfaces())
        .flat()
        .find(c => c.family === 'IPv4' && !c.internal)?.address;
}