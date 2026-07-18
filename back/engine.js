import crypto from 'node:crypto';
import { normalizeError } from './errors.js';

const LOG_TYPES = ['alert', 'error', 'data'];

class Engine{
    #store;
    #subscribers;
    #tables;
    constructor() {
        this.#store = [];
        this.#subscribers = new Set();
        this.#tables = new Map();
    }
    receiveLog(rawLog) {
        const { isValid, errors } = this.#validateRawLog(rawLog);

        if (!isValid) {
            return {
                statusCode: 400,
                body: { ok: false, errors }
            }
        }

        const logRecord = this.#transformRawLog(rawLog);
        this.#store.push(logRecord);

        const viewModel = this.#createLogViewModel(logRecord);
        this.#subscribers.forEach(cb => cb({type: 'LOG', payload: viewModel }));


        return {
            statusCode: 200,
            body: { ok: true }
        }
    }
    dispatch(callback) {
        this.#subscribers.add(callback);
        return () => this.#subscribers.delete(callback);
    }
    getHistory() {
        return this.#store.map(log => this.#createLogViewModel(log));
    }
    getTables() {
        return [...this.#tables.entries()].map(([id, table]) => ({
            config: { id, label: table.label, columns: table.columns, rowCount: table.rowCount },
            lastSnapshot: table.lastSnapshot ?? null
        }));
    }
    #validateRawLog(log) {
        if (!log || typeof log !== 'object') {
            return { isValid: false, errors: ['log must be an object'] };
        }

        const errors = [];
        const { sessionId, logId, timestamp, type, metadata} = log;

        if (typeof sessionId !== 'number') {
            errors.push('sessionId must be a number');
        }
        if (typeof logId !== 'number' || log.logId <= 0) {
            errors.push('logId must be a positive number');
        }
        if (typeof timestamp !== 'number' || timestamp <= 0) {
            errors.push('timestamp must be a positive number');
        }
        if (!LOG_TYPES.includes(type)) {
            errors.push(`type must be one of ${LOG_TYPES.join(', ')}`);
        }
        if (!metadata || typeof metadata !== 'object') {
            errors.push('metadata is required and must be an object');
        }

        if (errors.length > 0) {
            return { isValid: false, errors };
        }

        if ((!metadata.message || typeof metadata.message !== 'string') && type === 'alert') {
            errors.push('metadata.message is required and must be a string');
        }
        if ((typeof metadata.error?.name !== 'string' ||
            typeof metadata.error?.message !== 'string') && type === 'error') {
            errors.push('metadata.error is required and must be a serialized Error');
        }

        return { isValid: errors.length === 0, errors };
    }
    #transformRawLog(log) {
        const id = `${log.sessionId}${String(log.logId).padStart(4, '0')}`;
        const logRecord = {
            id,
            timestamp: log.timestamp,
            sessionId: log.sessionId,
            pid:  log.pid ?? 0,
            hostname : log.hostname ?? 'host',
            type: log.type,
            service: log.service ?? 'application',
            module: log.module ?? '/',
        }

        if (log.type === 'alert') {
            logRecord.message = log.metadata.message;
            logRecord.level = log.metadata.level ?? 'info';
        }
        if (log.type === 'error') {
            const { name, message, stack, cause } = normalizeError(log.metadata.error);

            logRecord.message = log.metadata.message ?? message;

            logRecord.errName = name;
            logRecord.errMessage = message;
            logRecord.errStack = stack;
            logRecord.errCause = cause;
            logRecord.errSeverity = log.metadata.severity ?? 3;
        }

        return logRecord;
    }
    #createLogViewModel(log) {
        const datetime = new Date(log.timestamp)
            .toLocaleString('sv-SE')
            .replace(' ', 'T')
            .slice(0, 16);
        const [date, time] = datetime.split('T');

        const vm = {
            id: log.id,
            type: log.type,
            level: log.level ?? log.type,
            datetime: datetime,

            header: {
                time: time,
                message: log.message,
                service: log.service
            },

            layouts: [],

            ui: {
                expandedLayouts: {
                    meta: false,
                }
            }
        }

        vm.layouts.push({
            name: 'meta',
            date: date,
            module: log.module,
            pid: log.pid,
            hostname: log.hostname,
        });
        if (log.errName) {
            const errLayout = {
                name: 'error',
                errorname: log.errName,
                message: log.errMessage,
                severity: log.errSeverity
            };
            vm.ui.expandedLayouts.error = false;
            if (log.errStack) {
                const stackLayout = {
                    name: 'stack-trace',
                    stack: log.errStack
                }
                errLayout.topframe = log.errStack[0];
                errLayout.stack = `${log.errStack.length} frames`;
                vm.layouts.push(errLayout);
                vm.layouts.push(stackLayout);
                vm.ui.expandedLayouts.stack = false;

                return vm;
            }
            vm.layouts.push(errLayout);
        }

        return vm;
    }
    #labelToId(label) {
        return crypto.createHash('md5').update(label).digest('hex').slice(0, 8);
    };
    receiveTable(setup) {
        const { isValid, errors } = this.#validateTableSetup(setup);

        if (!isValid) {
            return {
                statusCode: 400,
                body: { ok: false, errors }
            }
        }

        const { label, columns, rowCount } = setup;

        const id = this.#labelToId(label);



        this.#tables.set(id, { label, columns, rowCount });

        setup = { id, ...setup };

        this.#subscribers.forEach(cb => cb({ type: 'TABLE_SETUP', payload: setup }));

        return {
            statusCode: 200,
            body: { ok: true, id }
        }
    }
    #validateTableSetup(setup) {
        const errors = [];

        const response = () => {
            return { isValid: errors.length === 0, errors }
        };

        if (typeof setup !== 'object' || setup === null) {
            errors.push('table setup must be an object');
            return response();
        }

        const { label, columns, rowCount } = setup;

        if (typeof label !== 'string') {
            errors.push('label must be a string');
        }
        if (this.#tables.has(this.#labelToId(label))) {
            errors.push(`table '${label}' already exists`);
        }
        if (typeof rowCount !== 'number') {
            errors.push('rowCount must be a number');
        }
        if (!Array.isArray(columns) || columns.length === 0) {
            errors.push('columns must be an array');
            return response();
        }

        const notObject = columns.some(col => typeof col !== 'object');
        if (notObject) {
            errors.push('every column must be an object');
            return response();
        }

        const hasInvalidKey = columns.some(col => typeof col.key !== 'string');
        if (hasInvalidKey) {
            errors.push('key must be provided for each column');
        }
        
        const getSign = col => JSON.stringify(Object.keys(col).sort());
        const firstSign = getSign(columns[0]);
        const sameSignatures = columns.every(col => getSign(col) === firstSign);
        if (!sameSignatures) {
            errors.push('every column signature must be the same');
        }

        return response();
    }
    receiveSnapshot(snapshot) {
        const { isValid, errors } = this.#validateTableSnapshot(snapshot);

        if (!isValid) {
            return {
                statusCode: 400,
                body: { ok: false, errors }
            }
        }
        
        const { id, rows } = snapshot;
        this.#tables.get(id).lastSnapshot = rows;

        this.#subscribers.forEach(cb => cb({ type: 'TABLE_SNAPSHOT', payload: snapshot }));

        return {
            statusCode: 200,
            body: { ok: true }
        }
    }

    #validateTableSnapshot(snapshot) {
        const errors = [];

        const response = () => {
            return { isValid: errors.length === 0, errors };
        }

        if (typeof snapshot !== 'object' || snapshot === null) {
            errors.push('snapshot must be an object');
            return response();
        }

        const { id, rows } = snapshot;

        if (typeof id !== 'string') {
            errors.push('id must be a string');
        }
        if (!this.#tables.has(id)) {
            errors.push('no such table created');
        }
        if (!Array.isArray(rows) || rows.length === 0) {
            errors.push('rows must be an array');
            return response();
        }

        return response();
    }
}

const engine = new Engine();
export default engine;