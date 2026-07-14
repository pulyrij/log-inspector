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
// tableStore.addTable({
//     id: 'tradeRD',
//     label: 'Trade rustskins -> dmarket',
//     columns: [{
//         key: 'index',
//         title: 'I',
//         class: 'int',
//         width: 4
//     }, {
//         key: 'item_name',
//         title: 'Item',
//         class: 'long_name',
//         width: 43
//     }, {
//         key: 'first_market',
//         title: 'Market 1',
//         class: 'short_name',
//         width: 12
//     }, {
//         key: 'first_price',
//         title: 'Price 1',
//         class: 'price',
//         width: 8
//     }, {
//         key: 'second_market',
//         title: 'Market 2',
//         class: 'short_name',
//         width: 12
//     }, {
//         key: 'second_price',
//         title: 'Price 2',
//         class: 'price',
//         width: 8
//     }, {
//         key: 'profit',
//         title: 'Profit',
//         class: 'percent',
//         width: 9
//     }, {
//         key: 'count',
//         title: 'C',
//         class: 'int',
//         width: 4
//     }],
//     rowCount: 20,
//     options: {
//         captionHeight: 40,
//         headerHeight: 36,
//         rowHeight: 32
//     }
// });

// tableStore.updateSnapshot('tradeRD', [
//     {
//         index: 1,
//         fetch_time: 9833849879,
//         item_name: 'Blackout Python',
//         first_market: 'rustskins',
//         first_price: 4.67,
//         second_market: 'dmarket',
//         second_price: 5.02,
//         second_price_without_fee: 5.23,
//         profit_percent: 13,
//         profit_usd: 0.35,
//         profit_sign: 'positive',
//         count: 1
//     }
// ]);
export default tableStore;
