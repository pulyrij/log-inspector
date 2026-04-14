import crypto from 'crypto';

function randomId() {
    return crypto.randomInt(100_000_000_000, 999_999_999_999);
}

const log = {
    sessionId: randomId(),
    logId: 1,
    timestamp: Date.now(),
    pid: process.pid,
    hostname: 'DESKTOP-JF56S4',
    type: 'alert',
    service: 'logger',
    module: '/logger/client.js',
    metadata: {
        level: 'info',
        message: 'It works'
    }
};

async function sendLog(log) {
    await fetch("http://localhost:3000/logs", {
        method: "POST",

        headers: {
            "Content-Type" : "application/json"
        },

        body: JSON.stringify(log)
    });
}

sendLog(log);