class TableStore {
    #tables = new Map();

    addTable(config) {
        if (this.#tables.has(config.label)) return;
        this.#tables.set(config.label, {
            config,
            rows: [],
            pendig: true
        });
    }

    updateSnapshot(tableId, rows) {
        const table = this.#tables.get(tableId);
        if (!table) return;
        table.rows = rows;
        table.pending = true;
    }

    getPending() {
        const result = [];
        
        for ( const table of this.#tables.values()) {
            if (table.pendig) {
                result.push(table);
                table.pending = false;
            }
        }

        return result;
    }

    getAll() {
        return [...this.#tables.values()];
    }

    get(tableId) {
        return this.#tables.get(tableId);
    }
}

const tableStore = new TableStore();
tableStore.addTable({
    label: 'trade',
    columns: [1, 2, 3, 4],
    rowCount: 20
});
export default tableStore;
