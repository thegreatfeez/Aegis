declare class SimpleCache {
    private store;
    set<T>(key: string, value: T, ttlMs: number): void;
    get<T>(key: string): T | null;
    delete(key: string): void;
    clear(): void;
}
export declare const cache: SimpleCache;
export declare const TTL: {
    readonly YIELD_RATES: number;
    readonly NANSEN: number;
    readonly ELFA: number;
    readonly GROQ_BRIEF: number;
};
export {};
//# sourceMappingURL=cache.d.ts.map