import createLogElement from './log-creator.js';
import state from './store.js';

const logContainer = document.getElementById('log-container');

function renderLog(viewModel) {
    const logElement = createLogElement(viewModel);
    logContainer.appendChild(logElement);
}

const socket = new WebSocket('ws://localhost:3001');

socket.onopen = () => {
    console.log('Connected to backend');
}

socket.onmessage = (event) => {
    const message = JSON.parse(event.data);

    if (message.type === 'LOG') {
        const viewModel = message.payload;

        state.add(viewModel);
        renderLog(viewModel);
    }
};