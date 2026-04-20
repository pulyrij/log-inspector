import store from './store.js';
import connect from './socket.js';
import createLogElement from './log-creator.js';

connect();  

const scroller = document.getElementById('main');
const logContainer = document.getElementById('log-container');

let scrollPending = false;
let userIsScrolling = false;
let userScrollTimeout = null;

scroller.addEventListener('wheel', () => {
    userIsScrolling = true;
    clearTimeout(userScrollTimeout);
    userScrollTimeout = setTimeout(() => {
        userIsScrolling = false;
    }, 150);
});

scroller.addEventListener('touchmove', () => {
    userIsScrolling = true;
    clearTimeout(userScrollTimeout);
    userScrollTimeout = setTimeout(() => {
        userIsScrolling = false;
    }, 150);
});

function processLogs() {
    const logs = store.getPending();
    
    if (logs.length > 0) {
        const shouldScroll = isAtBottom(scroller);

        const fragment = document.createDocumentFragment();
        logs.forEach(log => {
            fragment.appendChild(createLogElement(log));
        });
        logContainer.appendChild(fragment);

        if (shouldScroll) {
            scroller.scrollTop = scroller.scrollHeight;
        }
    }

    requestAnimationFrame(processLogs);
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
}