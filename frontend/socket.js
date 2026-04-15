import store from './store.js';

const PORT = 3001;
const RETRY_DELAY = 10_000;

let socket;

export default function connect() {
    console.log('Connecting to backend...');

    socket = new WebSocket(`ws://localhost:${PORT}`);

    socket.onopen = () => {
        console.log('Connected to backend');
    };

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.type === 'LOG') {
            
            const viewModel = message.payload;

            store.add(viewModel);
        }
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