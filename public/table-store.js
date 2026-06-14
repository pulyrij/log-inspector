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
    label: 'Trade rustskins -> dmarket',
    columns: [{
        name: 'I',
        width: 3
    }, {
        name: 'Item',
        width: 50
    }, {
        name: 'Market 1',
        width: 9
    }, {
        name: 'Price 1',
        width: 9
    }, {
        name: 'Market 2',
        width: 9
    }, {
        name: 'Price 2',
        width: 9
    }, {
        name: 'Profit',
        width: 9
    }, {
        name: 'C',
        width: 2
    }],
    rowCount: 20
});
// tableStore.addTable({
//     label: 'Trade2 lootfarm -> cstrade',
//     columns: [1, 2, 3, 4],
//     rowCount: 20
// });
// tableStore.addTable({
//     label: 'Trade3 dmarket -> rust skins',
//     columns: [1, 2, 3, 4],
//     rowCount: 20
// });
export default tableStore;
