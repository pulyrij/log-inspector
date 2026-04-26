const engine1 = {
    receive: () => {},
    dispatch: () => {}
}

export default engine;

const LOG_TYPES = ['alert', 'error', 'data'];

const store = {
    logs: [],

    add(logRecord) {
        this.logs.push(logRecord);
    }
};

function transformRawLog(log) {
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

export default function logPipeline(log){
    const result = validateRawLog(log);
    if (!result.isValid) {
        return {
            statusCode: 400,
            end: (JSON.stringify({
                ok: false,
                errors: result.errors
            }))
        }
    }

    console.log(log)
    console.log('2')
    const logRecord = transformRawLog(log);
    console.log(logRecord);

    console.log(logRecord)
    console.log('3')
    store.add(logRecord);
    const viewModel = createLogViewModel(logRecord);
    console.log(viewModel)
    console.log('4')
    broadcast(viewModel);
    return {
        statusCode: 200,
        end: (JSON.stringify({
            ok: true,
            id: logRecord.id
        }))
    }
}

function getLogs() {
    return store.logs;
}

function createLogViewModel(log) {
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

const LOG_TYPES = ['alert', 'error', 'data'];

class Engine{
    #store;
    constructor() {
        this.store = [];

    }
    receive(log) {
        const { isValid, errors } = this.#validateRawLog(log);

        if (!isValid) {
            return {
                statusCode: 400,
                body: { ok: false, errors }
            }
        }

        return {
            statusCode: 200,
            body: { ok: true }
        }
    }
    dispatch() {

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
}

const engine = new Engine();
export default engine;