import crypto from 'crypto';

class Logger {
    constructor() {
        this.sessionId = this.#generateId();
    }
    #generateId() {
        return crypto.randomInt(100_000_000_000, 999_999_999_999);
    }
}


function log(message) {
    const logObject = formLogObj(message);
}
function formLogObj(message) {
    return {
        message: message,
        session: this.sessionId,
    }
}
function submitLog() {}