import crypto from 'crypto';
import os from 'node:os';

export default class LoggerClient{
    constructor(service) {
        this.sessionId = this.#sessionId();
        this.service = service;
        this.pid = process.pid;
        this.hostname = os.hostname();
        this.logCount = 0;
    }
    #sessionId() {
        return crypto.randomInt(100_000_000_000, 999_999_999_999);
    }
    #logId() {
        this.logCount++;
        return this.logCount;
    }
    async #sendLog(log) {
        await fetch('http://localhost:3000/logs', {
            method: 'POST',

            headers: {'Content-Type': 'application/json'},

            body: JSON.stringify(log)
        });
    }
    #createLog({message, type, level}) {
        return {
            sessionId: this.sessionId,
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
        const stack = new Error().stack.split('\n');
        console.log(stack);
        const line = stack[4] ?? '';
        const match = line.match(/at (.+?):\d+:\d+$/);
        return match ? match[1] : 'unknown';
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