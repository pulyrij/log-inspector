import createLogElement from './log-creator.js';

const logContainer = document.getElementById('log-container');

function renderLog(viewModel) {
    const logElement = createLogElement(viewModel);
    logContainer.appendChild(logElement);
}