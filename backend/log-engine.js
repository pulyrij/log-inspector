import { WebSocketServer } from 'ws';

const PORT = 3001;
const wss = new WebSocketServer({ port: PORT });
wss.on('connection', () => {
    console.log('Frontend connected');
})

const LOG_TYPES = ['alert', 'error', 'data'];

const store = {
    logs: [],

    add(logRecord) {
        this.logs.push(logRecord);
    }
};

function validateRawLog(log) {
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
        level: log.level ?? 'info',
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

    const logRecord = transformRawLog(log);
    console.log(logRecord);

    store.add(logRecord);
    const viewModel = createLogViewModel(logRecord);
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
    const date = new Date(log.timestamp);

    return {
        id: log.id,

        header: {
            time: date.toLocaleTimeString(),
            message: log.message,
            service: log.service
        },

        layouts: [
            {
                name: 'meta',
                date: date.toLocaleDateString(),
                module: log.module,
                level: log.level,
                pid: log.pid,
                host: log.hostname,
            }
        ],

        ui: {
            expendedLayouts: {
                meta: false
            },
            type: log.type,
            level: log.level,
        }
    }
}

function broadcast(viewModel) {
    const message = JSON.stringify({
        type: 'LOG',
        payload: viewModel
    });
    wss.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(message);
        }
    })
}