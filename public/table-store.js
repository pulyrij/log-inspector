class TableStore {
    #tables = new Map();

    addTable(config) {
        if (this.#tables.has(config.id)) return;
        this.#tables.set(config.id, {
            config,
            rows: [],
            pending: true
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
            if (table.pending) {
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
    id: 'tradeRD',
    label: 'Trade rustskins -> dmarket',
    columns: [{
        key: 'index',
        title: 'I',
        class: 'int',
        width: 4
    }, {
        key: 'item_name',
        title: 'Item',
        class: 'item',
        width: 43
    }, {
        key: 'first_market',
        title: 'Market 1',
        class: 'market',
        width: 12
    }, {
        key: 'first_price',
        title: 'Price 1',
        class: 'price',
        width: 8
    }, {
        key: 'second_market',
        title: 'Market 2',
        class: 'market',
        width: 12
    }, {
        key: 'second_price',
        title: 'Price 2',
        class: 'price',
        width: 8
    }, {
        key: 'profit',
        title: 'Profit',
        class: 'percent',
        width: 9
    }, {
        key: 'count',
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
tableStore.updateSnapshot('tradeRD', [
    {
        index: 1,
        item_name: 'Blackout Python',
        first_market: 'rustskins',
        first_price: 4.67,
        second_market: 'dmarket',
        second_price: 5.02,
        profit: 13,
        profit_sign: 'positive',
        count: 1
    },
    {
        index: 2,
        item_name: 'Large Candle Set',
        first_market: 'rustskins',
        first_price: 3.02,
        second_market: 'dmarket',
        second_price: 3.06,
        profit: 0.33,
        profit_sign: 'positive',
        count: 1
    },
    {
        index: 3,
        item_name: 'Red Jacet',
        first_market: 'rustskins',
        first_price: 0.15,
        second_market: 'dmarket',
        second_price: 0.15,
        profit: 0,
        profit_sign: 'zero',
        count: 22
    },
    {
        index: 4,
        item_name: 'Ninja AR',
        first_market: 'rustskins',
        first_price: 1.52,
        second_market: 'dmarket',
        second_price: 1.43,
        profit: -7,
        profit_sign: 'negative',
        count: 1
    }
]);
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
