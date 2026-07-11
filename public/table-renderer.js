export default function renderTable(tableVm) {
    const { config, rows } = tableVm;

    let table = document.querySelector(`[data-table="${config.id}"]`);

    if (!table) {
        table = createTableElement(config);
        const tableContainer = document.getElementById('table-container');
        tableContainer.appendChild(table);
    }

    updateRows(table, rows);
}

const defaults = {
    CAPTION_HEIGHT: 40,
    HEADER_HEIGHT: 36,
    ROW_HEIGHT: 32
}

function createTableElement(config) {
    const { id, label, columns, rowCount, options } = config;

    const table = document.createElement('table');
    table.classList.add('trade-table');
    table.dataset.table = id;


    const captionHeight = options?.captionHeight ?? defaults.CAPTION_HEIGHT;
    const headerHeight = options?.headerHeight ?? defaults.HEADER_HEIGHT;
    const rowHeight = options?.rowHeight ?? defaults.ROW_HEIGHT;
    const tableHeight = captionHeight + headerHeight + rowHeight * rowCount;

    table.style.height = `${tableHeight}px`;

    const caption = document.createElement('caption');
    caption.textContent = label;
    caption.style.height = `${captionHeight}px`;
    table.appendChild(caption);

    const colgroup = document.createElement('colgroup');

    columns.forEach(column => {
        const col = document.createElement('col');
        col.style.width = `${column.width}%`;
        colgroup.appendChild(col);
    });

    table.appendChild(colgroup);

    const header = document.createElement('thead');

    const headerRow = document.createElement('tr');
    headerRow.style.height = `${headerHeight}px`;

    columns.forEach(column => {
        const th = document.createElement('th');
        th.scope = 'col';
        th.classList.add(column.key);
        th.dataset.col = column.key;
        th.textContent = column.title;
        headerRow.appendChild(th);
    });

    header.appendChild(headerRow);
    table.appendChild(header);

    const tbody = document.createElement('tbody');
    
    for (let i = 0; i < rowCount; i++) {
        const tr = document.createElement('tr');
        tr.style.height = `${rowHeight}px`;
        columns.forEach(column => {
            const td = document.createElement('td');
            td.dataset.col = column.key;
            td.classList.add(column.key, column.class, 'empty');
            td.textContent = '—';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);

    const state = createTableState(config, table);
    setTableState(id, state);

    return table;
}

const EMPTY = '—';

const formatters = {
    percent: (value) => value === EMPTY ? value : `${value}%`,
    price: (value) => value === EMPTY ? value : `${value}$`,
    usd: (value) => value === EMPTY ? value : `${value}$`,
    default: (value) => value
}

const decorators = {
    percent: decorateProfit,
    usd: decorateProfit
}

function decorateProfit(td, value, rowVm) {
    td.classList.remove('profit-positive', 'profit-negative', 'profit-zero');
    if (value !== EMPTY) {
        td.classList.add(`profit-${rowVm.profit_sign}`);
    }
}
function getColumnType(td) {
    if (td.classList.contains('percent')) return 'percent';
    if (td.classList.contains('price')) return 'price';
    return 'default';
}

function updateCell(td, rowVm, tableState) {
    const columnKey = td.dataset.col;

    if (columnKey === 'item_name') {
        updateItemNameCell(td, rowVm);
        return;
    }
    
    const columnType = getColumnType(columnKey, tableState);

    const oldValue = td.textContent;
    let newValue = getColumnValue(columnKey, rowVm, tableState  ) ?? EMPTY;

    const oldEmpty = oldValue === EMPTY;
    const newEmpty = newValue === EMPTY;

    if (oldEmpty && newEmpty) return;
    
    td.classList.toggle('empty', newEmpty);

    newValue = (formatters[type] ?? formatters.default)(newValue);
    if (newValue === oldValue) return;

    if (!newEmpty) {
        decorators[type]?.(td, newValue, rowVm);
    }
    td.textContent = newValue;
}

function updateRows(tableEl, rows, tableState) {
    const tbody = tableEl.querySelector('tbody');
    const domRows = tbody.querySelectorAll('tr');

    const oldestFetchTime = null;   

    rows.forEach((rowVm, i) => {
        const tr = domRows[i];
        if (!tr) return;

        tr.dataset.name = rowVm.name
        tr.querySelectorAll('td').forEach(td => updateCell(td, rowVm, tableState));

        tableState.rows.set(i, rowVm);

        if (oldestFetchTime === null || rowVm.fetch_time < oldestFetchTime) {
            oldestFetchTime = rowVm.fetch_time;
        }
    });

    tableState.oldestFetchTime = oldestFetchTime;

    for (let i = rows.length; i < domRows.length; i++) {
        const tr = domRows[i];
        if (tr.dataset.name === '') continue;
        tr.dataset.name = '';
        tr.querySelectorAll('td').forEach(td => updateCell(td, {}, tableState));

        tableState.rows.delete(i);
    }
}

function formatElapsed(ms) {
    const totalSeconds = Math.floor(ms / 1000);

    if (totalSeconds < 60) return `${totalSeconds}s`;
    
    const totalMinutes = Math.floor(totalSeconds / 60);
    if (totalMinutes < 60) return `${totalMinutes}m`;

    const totalHours = Math.floor(totalMinutes / 60);
    return `${totalHours}h`;
}