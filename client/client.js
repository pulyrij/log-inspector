import crypto from 'crypto';
import os from 'node:os';

export default class LoggerClient{
    #sessionId;
    constructor(service) {
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
            await fetch('http://localhost:3000/logs', {
                method: 'POST',

                headers: {'Content-Type': 'application/json'},

                body: JSON.stringify(log)
            });
        } catch {
            console.log('log not sent');
        }
    }
    #createLog({message, type, level}) {
        return {
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
}