export default function renderTable(table) {
    console.log(2)
    let tableEl = document.querySelector(`[data-table="${table.config.label}"]`);

    if (!tableEl) {
        tableEl = createTableElement(table.config);
        const viewTable = document.getElementById('view-table');
        viewTable.appendChild(tableEl);
    }

    updateRows(tableEl, table.config, table.rows);
}

const ROW_HEIGHT = 32;
const THEAD_HEIGHT = 36;
const CAPTION_HEIGHT = 40;

function createTableElement(config) {
    console.log(1);
    const tableEl = document.createElement('table');
    tableEl.classList.add('trade-table');
    tableEl.dataset.table = config.label;

    const tableHeight = CAPTION_HEIGHT + THEAD_HEIGHT + ROW_HEIGHT * config.rowCount;
    tableEl.style.height = `${tableHeight}px`;

    return tableEl;
}

function updateRows(tableEl, config, rows) {
    
}