import store from './store.js';
import connect from './socket.js';
import createLogElement from './log-creator.js';

connect();  

const scroller = document.getElementById('main');

const logContainer = document.getElementById('log-container');

function renderLog(viewModel) {
    const shouldScroll = isAtBottom(scroller);

    const logElement = createLogElement(viewModel);

    logContainer.appendChild(logElement);

    if (shouldScroll) {
        scroller.scrollTop = scroller.scrollHeight;
    }
}

setInterval(() => {

    const logs = store.getPending();

    logs.forEach(log => {

        renderLog(log);

    });
}, 100);

function isAtBottom(el, threshold = 4) {
    return (
        el.scrollHeight
    - el.scrollTop
    - el.clientHeight
    ) <= threshold;
    
}