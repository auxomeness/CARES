import { Queue } from "bullmq";

import { getBullMqConnectionOptions } from "../../../config/redis";
import { logger } from "../../../shared/utils/logger";
import { NotificationDomainEvent } from "../types/notification.types";

export const NOTIFICATION_QUEUE_NAME = "cares-notifications";

let notificationQueue: Queue<NotificationDomainEvent> | undefined;

function getNotificationQueue(): Queue<NotificationDomainEvent> {
  const queue = new Queue(NOTIFICATION_QUEUE_NAME, {
    connection: getBullMqConnectionOptions(),
    defaultJobOptions: {
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 1000
      },
      removeOnComplete: 1000,
      removeOnFail: 5000
    }
  }) as Queue<NotificationDomainEvent>;

  queue.on("error", (error) => {
    logger.error({ error }, "Notification queue connection error");
  });

  notificationQueue = queue;
  return queue;
}

export async function enqueueNotificationEvent(event: NotificationDomainEvent): Promise<void> {
  await getNotificationQueue().add(event.type, event, {
    jobId: event.eventId
  });
}

export async function closeNotificationQueue(): Promise<void> {
  if (!notificationQueue) return;

  await notificationQueue.close();
  await notificationQueue.disconnect();
  notificationQueue = undefined;
}
