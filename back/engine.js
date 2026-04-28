import { normalizeError } from './errors.js';

const LOG_TYPES = ['alert', 'error', 'data'];

class Engine{
    #store;
    #subscribers;
    constructor() {
        this.#store = [];
        this.#subscribers = new Set();
    }
    receive(rawLog) {
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
        this.#subscribers.forEach(cb => cb(viewModel));


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
                    meta: false
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
            vm.layouts.push({
                name: 'error',
                errorName: log.errName,
                message: log.errMessage,
                severity: log.errSeverity
            });
        }
        if (log.errStack) {
            vm.layouts.push({
                name: 'error-stack',
                stack: log.errStack
            });
        }

        return vm;
    }
    
}

const engine = new Engine();
export default engine;