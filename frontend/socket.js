import store from './store.js';

const PORT = 3001;

const socket = new WebSocket(`ws://localhost:${PORT}`);

socket.onopen = () => {
    console.log('Connected to backend');
}

socket.onmessage = (event) => {
    const message = JSON.parse(event.data);

    if (message.type === 'LOG') {
        const viewModel = message.payload;

        store.add(viewModel);
    }
};