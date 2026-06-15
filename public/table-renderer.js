export default function renderTable(table) {
    let tableEl = document.querySelector(`[data-table="${table.config.label}"]`);

    if (!tableEl) {
        tableEl = createTableElement(table.config);
        const tableContainer = document.getElementById('table-container');
        tableContainer.appendChild(tableEl);
    }

    updateRows(tableEl, table.config, table.rows);
}

function createTableElement(config) {
    const { label, columns, rowCount, options } = config;

    const table = document.createElement('table');
    table.classList.add('trade-table');
    table.dataset.table = label;

    const tableHeight = options.captionHeight + options.headerHight + options.rowHeight * rowCount;
    table.style.height = `${tableHeight}px`;

    const caption = document.createElement('caption');
    caption.textContent = label;
    caption.style.height = `${options.captionHeight}px`;
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
    headerRow.style.height = `${options.headerHight}px`;

    columns.forEach(column => {
        const th = document.createElement('th');
        th.scope = 'col';
        th.classList.add(column.name);
        th.textContent = column.title;
        headerRow.appendChild(th);
    });

    header.appendChild(headerRow);
    table.appendChild(header);

    const tbody = document.createElement('tbody');
    
    for (let i = 0; i < rowCount; i++) {
        const tr = document.createElement('tr');
        tr.style.height = `${options.rowHeight}px`;
        columns.forEach(column => {
            const td = document.createElement('td');
            td.classList.add(column.name, column.class);
            td.textContent = '_';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);

    return table;
}

function updateRows(tableEl, config, rows) {
    
}