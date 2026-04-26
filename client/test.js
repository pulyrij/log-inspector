import LoggerClient from './client.js';

const log = new LoggerClient('http://192.168.88.18:3000/logs', 'parser');
log.error('Testing error logging', { error: new TypeError('Fuck niggers'), severity: 6})