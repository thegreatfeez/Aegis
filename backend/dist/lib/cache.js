"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TTL = exports.cache = void 0;
class SimpleCache {
    constructor() {
        this.store = new Map();
    }
    set(key, value, ttlMs) {
        this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
    }
    get(key) {
        const entry = this.store.get(key);
        if (!entry)
            return null;
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return entry.value;
    }
    delete(key) {
        this.store.delete(key);
    }
    clear() {
        this.store.clear();
    }
}
exports.cache = new SimpleCache();
// TTL constants (ms)
exports.TTL = {
    YIELD_RATES: 5 * 60 * 1000, // 5 minutes
    NANSEN: 10 * 60 * 1000, // 10 minutes
    ELFA: 5 * 60 * 1000, // 5 minutes
    GROQ_BRIEF: 60 * 1000, // 1 minute
};
//# sourceMappingURL=cache.js.map