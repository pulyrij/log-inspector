export default function renderTable(table) {
    let tableEl = document.querySelector(`[data-table="${table.config.label}"]`);

    if (!tableEl) {
        tableEl = createTableElement(table.config);
        const tableContainer = document.getElementById('table-container');
        tableContainer.appendChild(tableEl);
    }

    updateRows(tableEl, table.config, table.rows);
}

const ROW_HEIGHT = 32;
const THEAD_HEIGHT = 36;
const CAPTION_HEIGHT = 40;

function createTableElement(config) {
    const tableEl = document.createElement('table');
    tableEl.classList.add('trade-table');
    tableEl.dataset.table = config.label;

    const tableHeight = CAPTION_HEIGHT + THEAD_HEIGHT + ROW_HEIGHT * config.rowCount;
    tableEl.style.height = `${tableHeight}px`;

    const tableCaption = document.createElement('caption');
    tableCaption.textContent = config.label;
    tableCaption.style.height = `${CAPTION_HEIGHT}px`;
    tableEl.appendChild(tableCaption);

    const colgroup = document.createElement('colgroup');

    config.columns.forEach(column => {
        const col = document.createElement('col');
        col.style.width = `${column.width}%`;
        colgroup.appendChild(col);
    });

    tableEl.appendChild(colgroup);

    const tableHead = document.createElement('thead');

    const tableHeadRow = document.createElement('tr');
    tableHeadRow.style.height = `${THEAD_HEIGHT}px`;

    config.columns.forEach(column => {
        const th = document.createElement('th');
        th.setAttribute('scope', 'col');
        th.textContent = column.name;
        tableHeadRow.appendChild(th);
    });

    tableHead.appendChild(tableHeadRow);
    tableEl.appendChild(tableHead);

    return tableEl;
}

function updateRows(tableEl, config, rows) {
    
}