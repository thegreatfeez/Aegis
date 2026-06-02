"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
function log(level, message, meta) {
    const entry = {
        ts: new Date().toISOString(),
        level,
        msg: message,
    };
    if (meta) {
        // Strip any keys that might contain secrets
        const safe = { ...meta };
        delete safe['apiKey'];
        delete safe['authorization'];
        delete safe['groqApiKey'];
        Object.assign(entry, safe);
    }
    const line = JSON.stringify(entry);
    if (level === 'error') {
        console.error(line);
    }
    else {
        console.log(line);
    }
}
exports.logger = {
    info: (msg, meta) => log('info', msg, meta),
    warn: (msg, meta) => log('warn', msg, meta),
    error: (msg, meta) => log('error', msg, meta),
};
//# sourceMappingURL=logger.js.map