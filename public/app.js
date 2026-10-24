import store from './storage/store.js';
import tableStore from './storage/table-store.js';
import connect from './socket.js';
import createLogElement from './log-creator.js';
import renderTable, { startElapsedTimers } from './table-renderer.js';

connect();

document.getElementById('url').textContent = window.location.href;

const tabLogs = document.querySelector('#tab-logs');
const tabTables = document.querySelector('#tab-tables');
const viewLogs = document.querySelector('#view-logs');
const viewTables = document.querySelector('#view-tables');

function showTab(tabName) {
    const isLogs = tabName === 'logs';

    tabLogs.classList.toggle('active', isLogs);
    tabTables.classList.toggle('active', !isLogs);
    viewLogs.hidden = !isLogs;
    viewTables.hidden = isLogs;

    sessionStorage.setItem('activeTab', tabName);
}

tabLogs.addEventListener('click', () => showTab('logs'));
tabTables.addEventListener('click', () => showTab('tables'));

const savedTab = sessionStorage.getItem('activeTab') || 'logs';
showTab(savedTab);


const scroller = document.getElementById('view-logs');
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
function isAtBottom(el, bottomAutoscrollDistancePx = 80) {
    return (el.scrollHeight - el.scrollTop - el.clientHeight) <= bottomAutoscrollDistancePx;
}

function processTables() {
    const tables = tableStore.getPending();
    tables.forEach(table => {
        renderTable(table);
    });

    requestAnimationFrame(processTables);
}


requestAnimationFrame(processLogs);
requestAnimationFrame(processTables);
startElapsedTimers();