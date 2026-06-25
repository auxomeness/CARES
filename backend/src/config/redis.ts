import IORedis from "ioredis";

import { logger } from "../shared/utils/logger";
import { env } from "./env";

let cacheConnection: IORedis | undefined;

export function isRedisConfigured(): boolean {
  return Boolean(env.REDIS_URL);
}

export function createRedisConnection(name: string): IORedis {
  if (!env.REDIS_URL) {
    throw new Error(`Redis connection "${name}" requested without REDIS_URL`);
  }

  const connection = new IORedis(env.REDIS_URL, {
    connectionName: `cares-${name}`,
    connectTimeout: 2000,
    enableReadyCheck: true,
    lazyConnect: true,
    maxRetriesPerRequest: 1
  });

  connection.on("error", (error) => {
    logger.error({ error, redisConnection: name }, "Redis connection error");
  });

  return connection;
}

export function getBullMqConnectionOptions(options: { worker?: boolean } = {}) {
  if (!env.REDIS_URL) {
    throw new Error("BullMQ connection requested without REDIS_URL");
  }

  const url = new URL(env.REDIS_URL);
  const database = url.pathname.length > 1 ? Number(url.pathname.slice(1)) : 0;

  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username: url.username || undefined,
    password: url.password || undefined,
    db: Number.isNaN(database) ? 0 : database,
    tls: url.protocol === "rediss:" ? {} : undefined,
    connectTimeout: 2000,
    maxRetriesPerRequest: options.worker ? null : 1
  };
}

export function getCacheConnection(): IORedis | null {
  if (!isRedisConfigured()) return null;

  cacheConnection ??= createRedisConnection("cache");
  return cacheConnection;
}

export async function connectRedis(): Promise<void> {
  if (!isRedisConfigured()) return;

  const connection = getCacheConnection();
  if (connection?.status === "wait") {
    await connection.connect();
  }

  logger.info("Redis connection established");
}

export async function disconnectRedis(): Promise<void> {
  if (!cacheConnection) return;

  await cacheConnection.quit();
  cacheConnection = undefined;
}
