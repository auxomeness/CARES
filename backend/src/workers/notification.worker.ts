import { Job, Worker } from "bullmq";

import { connectDatabase, disconnectDatabase } from "../config/database";
import { env } from "../config/env";
import { getBullMqConnectionOptions } from "../config/redis";
import { handleNotificationEvent } from "../modules/notifications/service/notification.events";
import { NOTIFICATION_QUEUE_NAME } from "../modules/notifications/service/notification.queue";
import { NotificationDomainEvent } from "../modules/notifications/types/notification.types";
import { logger } from "../shared/utils/logger";

let worker: Worker<NotificationDomainEvent> | undefined;

async function bootstrap(): Promise<void> {
  if (!env.REDIS_URL) {
    throw new Error("REDIS_URL is required to run the notification worker");
  }

  await connectDatabase();

  worker = new Worker<NotificationDomainEvent>(
    NOTIFICATION_QUEUE_NAME,
    async (job: Job<NotificationDomainEvent>) => {
      await handleNotificationEvent(job.data);
    },
    {
      connection: getBullMqConnectionOptions({ worker: true }),
      concurrency: 10
    }
  );

  worker.on("completed", (job) => {
    logger.debug({ jobId: job.id, event: job.name }, "Notification job completed");
  });
  worker.on("failed", (job, error) => {
    logger.error({ error, jobId: job?.id, event: job?.name }, "Notification job failed");
  });

  logger.info({ concurrency: 10 }, "CARES notification worker started");
}

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  logger.info({ signal }, "Stopping CARES notification worker");
  await worker?.close();
  await disconnectDatabase();
  process.exit(0);
}

process.on("SIGINT", (signal) => void shutdown(signal));
process.on("SIGTERM", (signal) => void shutdown(signal));
process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled notification worker rejection");
  process.exit(1);
});
process.on("uncaughtException", (error) => {
  logger.error({ error }, "Uncaught notification worker exception");
  process.exit(1);
});

void bootstrap().catch((error) => {
  logger.error({ error }, "Failed to start CARES notification worker");
  process.exit(1);
});
