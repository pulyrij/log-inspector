import store from './store.js';
import tableStore from './table-store.js';

const PORT = 3000;
const RETRY_DELAY = 10_000;

let socket;

export default function connect() {
    console.log('Connecting to backend...');

    socket = new WebSocket(`ws://${window.location.hostname}:${PORT}/ws`);

    socket.onopen = () => {
        console.log('Connected to backend');
    };

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.type === 'LOG') store.add(message.payload);
        if (message.type === 'TABLE_SETUP') tableStore.addTable(message.payload);
        if (message.type === 'TABLE_SNAPSHOT') 
            tableStore.updateSnapshot(message.payload.id, message.payload.rows);
    };

    socket.onclose = () => {
        console.log('Connection closed. Retrying after delay');

        setTimeout(connect, RETRY_DELAY);
    };

    socket.onerror = (error) => {
        console.error('WebSocket error:', error);

        socket.close();
    };
}