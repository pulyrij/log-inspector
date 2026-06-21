import LoggerClient from './client.js';

const log = new LoggerClient('http://192.168.88.12:3000');

const table = await log.createTableStream({
    label: 'Testing transport and fisting',
    columns: [
        {
            key: 'index',
            title: 'III',
            class: 'int'
        },
        {
            key: 'item_name',
            title: 'Item',
            class: 'long_name'
        },
        {
            key: 'first_market',
            title: 'Market 1',
            class: 'short_name'
        },
        {
            key: 'first_price',
            title: 'Price 1',
            class: 'price'
        },
        {
            key: 'second_market',
            title: 'Market 2',
            class: 'short_name'
        },
        {
            key: 'second_price',
            title: 'Price 2',
            class: 'price'
        },
        {
            key: 'profit',
            title: 'Profit',
            class: 'percent'
        },
        {
            key: 'count',
            title: 'SS',
            class: 'int'
        }
    ],
    rowCount: 10
});