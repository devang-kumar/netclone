/**
 * Simple in-memory + sessionStorage cache for API responses.
 * TTL defaults to 5 minutes.
 */

const memCache = new Map();

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export const cache = {
  get(key) {
    // Check memory first
    const mem = memCache.get(key);
    if (mem && Date.now() < mem.expires) return mem.data;

    // Fall back to sessionStorage
    try {
      const raw = sessionStorage.getItem(`cache:${key}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Date.now() < parsed.expires) {
          memCache.set(key, parsed); // warm memory cache
          return parsed.data;
        }
        sessionStorage.removeItem(`cache:${key}`);
      }
    } catch {}

    return null;
  },

  set(key, data, ttl = DEFAULT_TTL) {
    const entry = { data, expires: Date.now() + ttl };
    memCache.set(key, entry);
    try {
      sessionStorage.setItem(`cache:${key}`, JSON.stringify(entry));
    } catch {}
  },

  invalidate(key) {
    memCache.delete(key);
    try { sessionStorage.removeItem(`cache:${key}`); } catch {}
  },

  invalidateAll() {
    memCache.clear();
    try {
      Object.keys(sessionStorage)
        .filter(k => k.startsWith('cache:'))
        .forEach(k => sessionStorage.removeItem(k));
    } catch {}
  },
};

/**
 * Cached axios GET — returns cached data if fresh, otherwise fetches.
 * Usage: cachedGet(axios, '/api/categories', 'categories', 10 * 60 * 1000)
 */
export const cachedGet = async (axios, url, cacheKey, ttl = DEFAULT_TTL) => {
  const hit = cache.get(cacheKey);
  if (hit) return hit;

  const res = await axios.get(url);
  const data = res.data?.data ?? res.data;
  cache.set(cacheKey, data, ttl);
  return data;
};
