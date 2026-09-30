/**
 * Keeps the last successfully fetched value for a given key in memory (per
 * server process) so that a transient read failure (a DB blip, a timeout,
 * a cold connection) can fall back to what was actually showing a moment
 * ago instead of the hardcoded placeholder defaults. Only once a key has
 * never succeeded does it fall back to `fallback`.
 */
const lastGood = new Map<string, unknown>();

export async function withLastGoodFallback<T>(
    key: string,
    fetcher: () => Promise<T>,
    fallback: T
): Promise<T> {
    try {
        const result = await fetcher();
        lastGood.set(key, result);
        return result;
    } catch {
        return (lastGood.has(key) ? lastGood.get(key) : fallback) as T;
    }
}
