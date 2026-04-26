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
    #validateRawLog(log) {
        if (!log || typeof log !== 'object') {
            return {
                isValid: false,
                errors: ['log must be an object']
            }
        }

        const errors = [];

        if (typeof log.sessionId !== 'number') {
            errors.push('sessionId must be a number');
        }
        if (typeof log.logId !== 'number' || log.logId <= 0) {
            errors.push('logId must be a positive number')
        }
        if (!LOG_TYPES.includes(log.type)) {
            errors.push(`type must be one of ${LOG_TYPES.join(', ')}`);
        }
        if (!log?.metadata?.message || typeof log.metadata.message !== 'string') {
            errors.push('metadata.message is required and must be a string');
        }

        return {
            isValid: errors.length === 0,
            errors
        }
    }
    #transformRawLog(log) {
        const id = `${log.sessionId}${String(log.logId).padStart(4, '0')}`;
        return {
            id,
            timestamp: log.timestamp,
            sessionId: log.sessionId,
            pid:  log.pid ?? 0,
            hostname : log.hostname ?? 'host',
            type: log.type,
            service: log.service ?? 'application',
            module: log.module ?? '/',
            level: log.metadata.level ?? 'info',
            message: log.metadata.message
        }
    }
    #createLogViewModel(log) {
        const datetime = new Date(log.timestamp)
            .toLocaleString('sv-SE')
            .replace(' ', 'T')
            .slice(0, 16);
        const [date, time] = datetime.split('T');

        return {
            id: log.id,
            type: log.type,
            level: log.level,
            datetime: datetime,

            header: {
                time: time,
                message: log.message,
                service: log.service
            },

            layouts: [
                {
                    name: 'meta',
                    date: date,
                    module: log.module,
                    pid: log.pid,
                    hostname: log.hostname,
                }
            ],

            ui: {
                expandedLayouts: {
                    meta: false
                }
            }
        }
    }
}

const engine = new Engine();
export default engine;