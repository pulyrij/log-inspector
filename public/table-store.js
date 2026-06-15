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
        name: 'index',
        title: 'I',
        class: 'int',
        width: 4
    }, {
        name: 'item-name',
        title: 'Item',
        class: 'item',
        width: 43
    }, {
        name: 'first-market',
        title: 'Market 1',
        class: 'market',
        width: 12
    }, {
        name: 'first-price',
        title: 'Price 1',
        class: 'price',
        width: 8
    }, {
        name: 'second-market',
        title: 'Market 2',
        class: 'market',
        width: 12
    }, {
        name: 'second-price',
        title: 'Price 2',
        class: 'price',
        width: 8
    }, {
        name: 'profit',
        title: 'Profit',
        class: 'percent',
        width: 9
    }, {
        name: 'count',
        title: 'C',
        class: 'int',
        width: 4
    }],
    rowCount: 20,
    options: {
        capthinHeight: 40,
        headerHeight: 36,
        rowHeight: 32
    }
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
