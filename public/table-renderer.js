export default function renderTable(tableVm) {
    const { config, rows } = tableVm;

    let table = document.querySelector(`[data-table="${config.id}"]`);

    if (!table) {
        table = createTableElement(config);
        const tableContainer = document.getElementById('table-container');
        tableContainer.appendChild(table);
    }

    console.log('1')
    updateRows(table, rows);
}

function createTableElement(config) {
    const { id, label, columns, rowCount, options } = config;

    const table = document.createElement('table');
    table.classList.add('trade-table');
    table.dataset.table = id;

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
    headerRow.style.height = `${options.headerHeight}px`;

    columns.forEach(column => {
        const th = document.createElement('th');
        th.scope = 'col';
        th.classList.add(column.key);
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
            td.dataset.col = column.key;
            td.classList.add(column.key, column.class, 'empty');
            td.textContent = '—';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);

    return table;
}

function updateRows(table, rows) {
    const tbody = table.querySelector('tbody');
    const domRows = tbody.querySelectorAll('tr');

    rows.forEach((rowData, i) => {
        const tr = domRows[i];
        if (!tr) return;

        tr.dataset.name = rowData.name;
        
        tr.querySelectorAll('td').forEach(td => {
            let newValue = String(rowData[td.dataset.col] ?? '—');
            if (td.textContent !== newValue) {
                td.classList.toggle('empty', newValue === '—');

                if (td.classList.contains('percent')) {
                    newValue = updateProfit(td, newValue);
                }

                td.textContent = newValue;
            }
        });
    });

    for (let i = rows.length; i < domRows.length; i++) {
        const tr = domRows[i];
        if (tr.dataset.name === '') return;
        tr.dataset.name = '';
        tr.querySelectorAll('td').forEach(td => td.textContent = '—');
    }
}
function updateProfit(tdEl, newValue) {
    if (newValue === '—') {
        tdEl.classList.remove('profit-positive', 'profit-negative', 'profit-zero');
        return;
    }
    const oldValue = tdEl.textContent;
    const oldValueProfitSign = getProfitClass(parseInt(oldValue));
    const newValueProfitSign = getProfitClass(newValue);

    if (newValueProfitSign !== oldValueProfitSign) {
        tdEl.classList.remove('profit-positive', 'profit-negative', 'profit-zero');
        tdEl.classList.add(newValueProfitSign);
    }

    return `${newValue}%`;
}
function getProfitClass(profit) {
    if (profit > 0) return 'profit-positive';
    if (profit < 0) return 'profit-negative';
    return 'profit-zero';
}