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