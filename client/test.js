import LoggerClient from './client.js';

const log = new LoggerClient('http://192.168.88.11:3000', 'parser');
log.info('I was born today');
log.warn('You fucking gay!');
log.event('Lubchiku nassali v ebalo');