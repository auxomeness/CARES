import { getCacheConnection } from "../../config/redis";
import { logger } from "./logger";

export async function cacheGetOrSet<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>
): Promise<T> {
  const redis = getCacheConnection();
  if (!redis || ttlSeconds === 0) return loader();

  try {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached) as T;
  } catch (error) {
    logger.warn({ error, cacheKey: key }, "Cache read failed");
  }

  const value = await loader();

  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (error) {
    logger.warn({ error, cacheKey: key }, "Cache write failed");
  }

  return value;
}

export async function invalidateCachePattern(pattern: string): Promise<void> {
  const redis = getCacheConnection();
  if (!redis) return;

  try {
    let cursor = "0";
    do {
      const [nextCursor, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
      cursor = nextCursor;
      if (keys.length > 0) await redis.del(...keys);
    } while (cursor !== "0");
  } catch (error) {
    logger.warn({ error, cachePattern: pattern }, "Cache invalidation failed");
  }
}
