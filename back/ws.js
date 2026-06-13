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
        const send = (data) => {
            if (ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify(data));
            }
        }
        const unsubscribe = engine.dispatch(event => send(event));
        
        
        engine.getHistory().forEach(log => {
            send({ type: 'LOG', payload: log });
        });

        engine.getTables().forEach(({ config, lastSnapshot }) => {
            send({ type: 'TABLE_SETUP', payload: config });
            if (lastSnapshot) send({ type: 'TABLE_SNAPSHOT', payload: lastSnapshot });
        });
            
        ws.on('close', () => unsubscribe());

        ws.on('error', (err) => {
            console.log('WS error: ', err);
            ws.close();
        })
    });
}