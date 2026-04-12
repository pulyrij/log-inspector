const rawLog = {
    "sessionId" : 374856738412,
    "logId" : 1,
    "timestamp" : 	1775910918000,
    "pid" : 5343,
    "hostname" : "linuxmint030",
    "type" : "alert",
    "service" : "parser",
    "module" : "/services/parser/index.js",
    "metadata" : {
        "level" : "info",
        "message" : "Parser initialized"
    }
}
const logRecord = {
    id: 3748567384120001, // session id + log id

    //time
    timestamp: 1775910918000,
    date: '12-04-2026',
    time: '18_39',

    //session
    sessionId: 374856738412,
    pid: 5343,
    hostname: "linuxmint030",

    type: "alert",
    service: "parser",
    module: "/services/parser/index.js",
    level: "info",
    message: "Parser initialized",
}

// invalid log if !type, !timestamp, !message, !sessionId, !logId
// всі інші значення за відсутності повинні замінятися дефолтними значеннями

function validate(log) {
    if (!log.type || typeof log.type !== 'string' ||
        (log.type !== 'alert' && log.type !== 'error' && log.type !== 'data')
    ) return {
        isValid: false,
        reason: 'invalid type'
    }
    if (!log.timestamp || typeof log.timestamp !== 'number' ||
        String(log.timestamp).length !== 13
    ) return {
        isValid: false,
        reason: 'invalid timestamp'
    }
    if (!log.message || typeof log.message !== 'string' || 
        log.message.length < 1
    ) return {
        isValid: false,
        reason: 'invalid message'
    }
    if (!log.sessionId || typeof log.sessionId !== 'Number' ||
        String(log.sessionId).length !== 12 
    ) return {
        isValid: false,
        reason: 'invalid sessionId'
    }
    if (!log.logId || typeof log.logId !== 'Number' ||
        log.logId < 1 || log.logId > 9999
    ) return {
        isValid: false,
        reason: 'invalid logId'
    }
    return {
        isValid: true,
        reason: null
    }
}