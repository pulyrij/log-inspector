import store from './store.js';
import './socket.js';
import createLogElement from './log-creator.js';

const logContainer = document.getElementById('log-container');

function renderLog(viewModel) {
    const logElement = createLogElement(viewModel);
    logContainer.appendChild(logElement);
}

setInterval(() => {

    const logs = store.getPending();

    logs.forEach(log => {

        renderLog(log);

    });
}, 100);