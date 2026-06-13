import store from './store.js';
import tableStore from './table-store.js';
import connect from './socket.js';
import createLogElement from './log-creator.js';
import renderTable from './table-renderer.js';

connect();

document.getElementById('url').textContent = window.location.href;

const tabs = document.querySelectorAll('nav button');

const viewMain = document.getElementById('view-main');
const viewTable = document.getElementById('view-table');

document.getElementById('tab-main').addEventListener('click', (el) => {
    tabs.forEach(t => t.classList.remove('active'));
    el.currentTarget.classList.add('active');
    viewMain.hidden = false;
    viewTable.hidden = true;
});
document.getElementById('tab-table').addEventListener('click', (el) => {
    tabs.forEach(t => t.classList.remove('active'));
    el.currentTarget.classList.add('active');
    viewMain.hidden = true;
    viewTable.hidden = false;
});

const scroller = document.getElementById('view-main');

const logContainer = document.getElementById('log-container');

function processLogs() {
    const logs = store.getPending();
    
    if (logs.length > 0) {
        const shouldScroll = isAtBottom(scroller);

        const fragment = document.createDocumentFragment();
        logs.forEach(log => {
            try {
                fragment.appendChild(createLogElement(log));
            } catch (err) {
                console.error(err);
                console.log(log);
            }
        });
        logContainer.appendChild(fragment);

        if (shouldScroll) {
            scroller.scrollTop = scroller.scrollHeight;
        }
    }

    requestAnimationFrame(processLogs);
}

requestAnimationFrame(processLogs);

function processTables() {
    console.log(3)
    const tables = tableStore.getPending();
    tables.forEach(table => {
        renderTable(table);
    });

    requestAnimationFrame(processTables);
}

requestAnimationFrame(processTables);

function isAtBottom(el, threshold = 80) {
    return (el.scrollHeight - el.scrollTop - el.clientHeight) <= threshold;
}
