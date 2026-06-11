import crypto from 'crypto';
import os from 'node:os';

export function serializeError(error) {
    if (!(error instanceof Error)) return error;

    return {
        name: error.name,
        message: error.message,
        stack: error.stack ?? null,
        projectRoor: process.cwd().replace(/\\/g, '/').toLowerCase(),
        cause: error.cause ? serializeError(error.cause) : null,
        path: error.path ?? null,
        selector: error.selector ?? null,
        event: error.event ?? null,
        reason: error.reason ?? null,
        state: error.state ?? null
    };
}

export default class LoggerClient{
    #sessionId;
    constructor(baseUrl, service = '') {
        this.baseUrl = baseUrl;
        this.#sessionId = crypto.randomInt(100_000_000_000, 999_999_999_999);
        this.service = service;
        this.pid = process.pid;
        this.hostname = os.hostname();
        this.logCount = 0;
    }
    #logId() {
        this.logCount++;
        return this.logCount;
    }
    async #sendLog(log) {
        try {
            const res = await fetch(`${this.baseUrl}/logs/log`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(log)
            });

            if (res.status === 400) {
                const { errors } = await res.json();
                console.error('Log rejected: ', errors);
            }
        } catch {
            console.error('Log not sent');
        }
    }
    #createLog({ message, type, level, error, severity }) {
        const log =  {
            sessionId: this.#sessionId,
            logId: this.#logId(),
            timestamp: Date.now(),
            pid: this.pid,
            hostname: this.hostname,
            type,
            service: this.service,
            module: this.#getCallerModule(),
            metadata: {
                level,
                message,
            }
        }

        if (type === 'error') {
            log.metadata.error = serializeError(error);
            log.metadata.severity = severity;
        }

        return log;
    }
    #getCallerModule() {
        try {
            const stack = new Error().stack.split('\n');
            const line = stack[4] ?? '';
            const match = line.match(/at (.+?):\d+:\d+$/);
            if (!match) return 'unknown';
            const filePath = decodeURIComponent(new URL(match[1]).pathname
                .replace(/^\//, '')
                .replace(/\\/g, '/')
            );
            const cwd = process.cwd().replace(/\\/g, '/').toLowerCase() + '/';
            return '/' + filePath.toLowerCase().replace(cwd, '') || 'unknown';
        } catch {
            return 'unknown';
        }
    }
    info(message) {
        const log = this.#createLog({
            message,
            type: 'alert',
            level: 'info'
        });
        this.#sendLog(log);
    }
    warn(message) {
        const log = this.#createLog({
            message,
            type: 'alert',
            level: 'warn'
        });
        this.#sendLog(log);
    }
    event(message) {
        const log = this.#createLog({
            message,
            type: 'alert',
            level: 'event'
        });
        this.#sendLog(log);
    }
    error(message, {
        error,
        severity,
    }) {
        const log = this.#createLog({
            message,
            type: 'error',
            error: error,
            severity: severity
        });
        this.#sendLog(log);
    }
    async createTableStream(label, columns, rowCount) {
        const baseUrl = this.baseUrl;
        const setup = {
            label,
            columns,
            rowCount
        }

        try {
            const res = await fetch(`${baseUrl}/logs/table`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(setup)
            });

            if (res.status === 400) {
                const { errors } = await res.json();
                console.error('Creation of table rejected: ', errors);   
            }
        } catch {
            console.error('Creation setup not sent');
            return null;
        }

        return {
            async update(rows) {
                try {
                    const res = await fetch(`${baseUrl}/logs/snapshot`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ table: label, rows: rows })
                    });

                    if (res.status === 400) {
                        const { errors } = await res.json();
                        console.error('Sending table snapshot rejected: ', errors);
                    }
                } catch {
                    console.error('Table snapshot not sent');
                }
            }
        }
    }
}