import { WebSocketServer } from 'ws';
import engine from './engine.js';

export function initWS(server) {
    const wss = new WebSocketServer({ noServer: true });

    server.on('upgrade', (req, socket, head) => {
        if (req.url === '/ws') {
            wss.handleUpgrade(req, socket, head, (ws) => {
                wss.emit('connection', ws, req);
            });
        } else {
            socket.destroy();
        }
    });

    wss.on('connection', (ws) => {
        const unsubscribe = engine.dispatch((log) => {
            if (ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify({ type: 'LOG', payload: log }));
            }
        });

        engine.getHistory().forEach(log => {
            ws.send(JSON.stringify({ type: 'LOG', payload: log }));
        });
        
        ws.on('close', () => unsubscribe());

        ws.on('error', (err) => {
            console.log('WS error: ', err);
            ws.close();
        })
    });
}