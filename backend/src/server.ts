import { Server } from "node:http";

import { app } from "./app";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { env } from "./config/env";
import { connectRedis, disconnectRedis } from "./config/redis";
import { closeNotificationQueue } from "./modules/notifications/service/notification.queue";
import { logger } from "./shared/utils/logger";

let server: Server | undefined;

async function bootstrap(): Promise<void> {
  try {
    await connectDatabase();
    if (env.REDIS_URL) {
      await connectRedis();
    } else if (env.NOTIFICATION_QUEUE_REQUIRED) {
      throw new Error("Redis is required but REDIS_URL is not configured");
    }

    server = app.listen(env.PORT, () => {
      logger.info(
        {
          port: env.PORT,
          notificationQueueEnabled: env.NOTIFICATION_QUEUE_ENABLED,
          redisConfigured: Boolean(env.REDIS_URL)
        },
        "CARES API started"
      );
    });
  } catch (error) {
    logger.error({ error }, "Failed to start CARES API");
    process.exit(1);
  }
}

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  logger.info(`${signal} received. Shutting down CARES API.`);

  if (server) {
    server.close(async () => {
      await closeNotificationQueue();
      await disconnectRedis();
      await disconnectDatabase();
      logger.info("CARES API shutdown complete.");
      process.exit(0);
    });
    return;
  }

  await closeNotificationQueue();
  await disconnectRedis();
  await disconnectDatabase();
  process.exit(0);
}

process.on("SIGINT", (signal) => {
  void shutdown(signal);
});

process.on("SIGTERM", (signal) => {
  void shutdown(signal);
});

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled promise rejection");
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  logger.error({ error }, "Uncaught exception");
  process.exit(1);
});

void bootstrap();
