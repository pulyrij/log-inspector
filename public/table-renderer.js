import { createTableState, setTableState, getTableState, getColumnType, getColumnValue } from './table-state.js';

export default function renderTable(tableVm) {
    const { config, rows } = tableVm;

    let table = document.querySelector(`[data-table="${config.id}"]`);

    if (!table) {
        table = createTableElement(config);
        const tableContainer = document.getElementById('table-container');
        tableContainer.appendChild(table);
    }

    const tableState = getTableState(config.id);
    updateRows(table, rows, tableState);
}

export function startElapsedTimers() {
    setInterval(() => {
        document.querySelectorAll('[data-fetch-time]').forEach(el => {
            const fetchTime = Number(el.dataset.fetchTime);
            el.textContent = formatElapsed(Date.now() - fetchTime);
        });
    }, 1000);
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
    caption.style.height = `${captionHeight}px`;

    const labelSpan = document.createElement('span');
    labelSpan.textContent = label;
    labelSpan.classList.add('caption-label');

    const timerSpan = document.createElement('span');
    timerSpan.classList.add('caption-timer');

    caption.append(labelSpan, timerSpan);
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
        th.style.height = `${headerHeight}px`;
        th.scope = 'col';
        th.classList.add(column.key);
        th.dataset.col = column.key;
        th.textContent = column.title;
        headerRow.appendChild(th);
    });

    headerRow.addEventListener('click', (event) => {
        const th = event.target.closest('th');
        if (!th || th.dataset.col !== 'profit') return;

        const tableState = getTableState(id);
        tableState.profitMode = tableState.profitMode === 'percent' ? 'usd' : 'percent';

        rerenderProfitColumn(table, tableState);
    });

    header.appendChild(headerRow);
    table.appendChild(header);

    const tbody = document.createElement('tbody');
    
    for (let i = 0; i < rowCount; i++) {
        const tr = document.createElement('tr');
        tr.style.height = `${rowHeight}px`;
        columns.forEach(column => {
            const td = document.createElement('td');
            td.style.height = `${rowHeight}px`;
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

function rerenderProfitColumn(table, tableState) {
    const tbody = table.querySelector('tbody');
    const rows = tbody.querySelectorAll('tr');

    rows.forEach((tr, i) => {
        const rowVm = tableState.rows.get(i);
        if (!rowVm) return;

        const td = tr.querySelector('[data-col="profit"]');
        updateCell(td, rowVm, tableState);
    });
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

function updateCell(td, rowVm, tableState) {
    const columnKey = td.dataset.col;

    if (columnKey === 'item_name') {
        updateItemNameCell(td, rowVm);
        return;
    }

    if (columnKey === 'second_price') {
        updateSecondPriceCell(td, rowVm);
        return;
    }
    
    const columnType = getColumnType(columnKey, tableState);

    const oldValue = td.textContent;
    let newValue = getColumnValue(columnKey, rowVm, tableState  ) ?? EMPTY;

    const oldEmpty = oldValue === EMPTY;
    const newEmpty = newValue === EMPTY;

    if (oldEmpty && newEmpty) return;
    
    td.classList.toggle('empty', newEmpty);

    newValue = (formatters[columnType] ?? formatters.default)(newValue);
    if (newValue === oldValue) return;

    if (!newEmpty) {
        decorators[columnType]?.(td, newValue, rowVm);
    }
    td.textContent = newValue;
}

function updateItemNameCell(td, rowVm) {
    const newEmpty = rowVm.item_name == null;
    td.classList.toggle('empty', newEmpty);

    if (newEmpty) {
        td.textcontent = EMPTY;
        return;
    }

    let nameSpan = td.querySelector('.cell-name');
    let timerSpan = td.querySelector('.cell-timer');

    if (!nameSpan) {
        td.textContent = '';
        nameSpan = document.createElement('span');
        nameSpan.classList.add('cell-name');
        timerSpan = document.createElement('span');
        timerSpan.classList.add('cell-timer');
        td.append(nameSpan, timerSpan);
    }

    if (nameSpan.textContent !== rowVm.item_name) {
        nameSpan.textContent = rowVm.item_name;
    }

    timerSpan.dataset.fetchTime = rowVm.fetch_time;
    timerSpan.textContent = formatElapsed(Date.now() - rowVm.fetch_time);
}

function updateSecondPriceCell(td, rowVm) {
    const newEmpty = rowVm.second_price == null;
    const oldEmpty = td.classList.contains('empty');

    if (newEmpty && oldEmpty) return;

    td.classList.toggle('empty', newEmpty);

    if (newEmpty) {
        td.textContent = EMPTY;
        return;
    }

    let mainSpan = td.querySelector('.cell-price-main');
    let subSpan = td.querySelector('.cell-price-sub');

    if (!mainSpan) {
        td.textContent = '';
        mainSpan = document.createElement('span');
        mainSpan.classList.add('cell-price-main');
        subSpan = document.createElement('span');
        subSpan.classList.add('cell-price-sub');
        td.append(mainSpan, subSpan);
    }

    const mainText = formatters.price(rowVm.second_price);
    if (mainSpan.textContent !== mainText) {
        mainSpan.textContent = mainText;
    }

    const subText = formatters.price(rowVm.second_price_without_fee);
    if (subSpan.textContent !== subText) {
        subSpan.textContent = subText;
    }
}

function updateRows(tableEl, rows, tableState) {
    const tbody = tableEl.querySelector('tbody');
    const domRows = tbody.querySelectorAll('tr');

    let oldestFetchTime = null;   

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

    const captionTimer = document.querySelector('.caption-timer');
    if (oldestFetchTime !== null) {
        captionTimer.dataset.fetchTime = oldestFetchTime;
        captionTimer.textContent = formatElapsed(Date.now() - oldestFetchTime);
    } else {
        delete captionTimer.dataset.fetchTime;
        captionTimer.textContent = '';
    }

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