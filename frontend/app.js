import store from './store.js';
import connect from './socket.js';
import createLogElement from './log-creator.js';

connect();

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