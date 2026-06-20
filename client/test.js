import LoggerClient from './client.js';

const log = new LoggerClient('http://192.168.88.12:3000');

const table = await log.createTableStream({
    label: 'Testing transport and render',
    columns: [
        { key: 'zeleboba' },
        { key: 'putler' },
        { key: 'trup_m' }
    ],
    rowCount: 10
});