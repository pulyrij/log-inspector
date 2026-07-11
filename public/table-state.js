const tableStates = new Map();

function createTableState(config, tableEl) {
    const columnsByKey = new Map(config.columns.map(col => [col.key, col]));

    return {
        el: tableEl,
        config,
        columns: columnsByKey,
        rows: new Map(),
        profitMode: 'percent',
        oldestFetchTime: null
    };
}

function setTableState(id, state) {
    tableStates.set(id, state);
}

function getTableState(id) {
    return tableStates.get(id);
}

function getColumnType(columnKey, tableState) {
    if (columnKey === 'profit') {
        return tableState.profitMode;
    }
    const column = tableState.columns.get(columnKey);
    return column.class;
}