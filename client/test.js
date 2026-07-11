import LoggerClient from './client.js';

const log = new LoggerClient('http://192.168.88.14:3000');

const table = await log.createTableStream({
    label: 'Pidor',
    columns: [
        {
            key: 'index',
            title: 'III',
            class: 'int',
            width: 4
        },
        {
            key: 'item_name',
            title: 'Item',
            class: 'long_name',
            width: '41'
        },
        {
            key: 'first_market',
            title: 'Market 1',
            class: 'short_name',
            width: 12
        },
        {
            key: 'first_price',
            title: 'Price 1',
            class: 'price',
            width: 9
        },
        {
            key: 'second_market',
            title: 'Market 2',
            class: 'short_name',
            width: 12
        },
        {
            key: 'second_price',
            title: 'Price 2',
            class: 'price',
            width: 9

        },
        {
            key: 'profit',
            title: 'Profit',
            class: 'percent',
            width: 9
        },
        {
            key: 'count',
            title: 'SS',
            class: 'int',
            width: 4
        }
    ],
    rowCount: 10
});
const a = [
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
]
const b = [
    {
        index: 4,
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
        index: 1,
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
        index: 2,
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
        index: 3,
        item_name: 'Ninja AR',
        first_market: 'rustskins',
        first_price: 1.52,
        second_market: 'dmarket',
        second_price: 1.43,
        profit: -7,
        profit_sign: 'negative',
        count: 1
    }
]

import { setTimeout, setInterval } from 'node:timers/promises';

export async function delay(ms = 1000, { signal } = {}) {
    const randomMs = Math.floor(Math.random() * ms + ms / 2);
    try {
        await setTimeout(randomMs, null, { signal });
    } catch (err) {
        throw new AbortError('Aborted', { cause: err, reason: signal?.reason });
    }
}

const runTableLoop = async () => {
    while (true) {
        await table.update(a);
        await delay(2000);
        await table.update(b);
        await delay(2000);
    }
};

runTableLoop();