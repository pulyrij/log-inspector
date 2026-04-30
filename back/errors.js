export class BrowserError extends Error {
    constructor(message, options = {}) {
        super(message);
        this.name = 'BrowserError';
        this.cause = options.cause;
    }
}

export class CampError extends Error {
    constructor(message, { cause, type = 'unknown' } = {}) {
        super(message, { cause });
        this.name = 'CampError';
        this.type = type;
    }
}
export class ClickError extends Error {
    constructor(message, { cause, selector } = {}) {
        super(message, { cause });
        this.name = 'ClickError';
        this.selector = selector ?? null;
    } 
}
export class QueueError extends Error {
    constructor(message, { cause }) {
        super(message, { cause });
        this.name = 'QueueError';
    }
}

export class FsError extends Error {
    constructor(message, options = {}) {
        super(message);
        this.name = 'FsError';
        this.cause = options.cause;
        this.path = options.path;
    }
}
export class AbortError extends Error {
    constructor(message, { reason, cause }) {
        super(message);
        this.name = 'AbortError';
        this.reason = reason;
        this.cause = cause;
    }
}
export class HFSMError extends Error{
    constructor(message, { state, event, reason }) {
        super(message);
        this.name = 'HFSMError';
        this.state = state;
        this.event = event;
        this.reason = reason;   
    }
}

export function serializeError(error) {
    if (!(error instanceof Error)) return error;

    return {
        name: error.name,
        message: error.message,
        stack: error.stack ? sanitizeStack(error.stack) : null,
        cause: error.cause ? serializeError(error.cause) : null,
        path: error.path ? error.path : null,
        selector: error.selector ? error.selector : null,
        event: error.event ? error.event : null,
        reason: error.reason ? error.reason : null,
        state: error.state ? error.state : null
    };
}

const PROJECT_ROOT = process.cwd().replace(/\\/g, '/').toLowerCase();

function cleanFrame(frame, projectRoot = PROJECT_ROOT) {
    frame = frame.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    if (/\(node:[^)]+\)/.test(frame)) {
        return frame.replace(/\(node:[^)]+\)/g, '(node:internal)');
    }

    frame = frame.replace(/file:\/\/\//g, '');

    const withParens = /\(([^)]+:\d+:\d+)\)/;
    const withoutParens = /^at (.+:\d+:\d+)$/;

    const replacePath = (path) => {
        const decoded = decodeURIComponent(path).replace(/\\/g, '/');
        const relative = decoded.toLowerCase().replace(projectRoot + '/', '');
        return relative;
    };

    if (withParens.test(frame)) {
        return frame.replace(withParens, (_, path) => `(${replacePath(path)})`);
    }

    const match = frame.match(withoutParens);
    if (match) {
        return `at ${replacePath(match[1])}`;
    }

    return frame;
}

function extractStack(error) {
    if (!error?.stack) return null;

    const projectRoot = error.projectRoot ?? PROJECT_ROOT;

    const frames = error.stack
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('at '))
        .map(frame => cleanFrame(frame, projectRoot))
        .filter(Boolean);
    
    return frames.length ? frames : null;
}
function normalizeCause(cause, depth = 0) {
    if (depth > 3) return { message: '[cause message truncated]' };
    if (cause == null) return null;

    if (cause?.name && cause?.message) {
        return {
            name: cause.name,
            message: cause.message,
            stack: extractStack(cause),
            cause: normalizeCause(cause.cause, depth + 1)
        };
    }

    return { message: String(cause?.message ?? JSON.stringify(cause)) };
}
export function normalizeError(error) {
    if (error == null) return {
        name: 'UnknownError',
        message: String(error),
        stack: null,
        cause: null
    }
    return {
        name: error.name,
        message: error.message,
        stack: extractStack(error),
        cause: normalizeCause(error.cause)
    };
}