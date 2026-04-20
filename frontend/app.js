import store from './store.js';
import connect from './socket.js';
import createLogElement from './log-creator.js';

connect();

const logContainer = document.getElementById('log-container');

function renderLog(viewModel) {
    const logElement = createLogElement(viewModel);
    logContainer.appendChild(logElement);
}

requestAnimationFrame(processLogs);


function isAtBottom(el, threshold = 80) {
    return (el.scrollHeight - el.scrollTop - el.clientHeight) <= threshold;
}
function scrollToBottom(el) {
    if (scrollPending) return;
    scrollPanding = true;
    requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
        scrollPanding = false;  
    });
};
