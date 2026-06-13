export default function renderTable(table) {
    let tableEl = document.querySelector(`[data-table="${table.config.label}"]`);

    if (!tableEl) {
        tableEl = createTableElement(table.config);
        const viewTable = document.getElementById('view-table');
        viewTable.appendChild(tableEl);
    }

    updateRows(tableEl, table.config, table.rows);
}