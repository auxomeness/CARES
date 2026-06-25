import { randomUUID } from "node:crypto";

import { prisma } from "../src/config/database";
import { disconnectRedis } from "../src/config/redis";
import {
  closeNotificationQueue,
  enqueueNotificationEvent
} from "../src/modules/notifications/service/notification.queue";
import { NotificationEventType } from "../src/modules/notifications/types/notification.types";

async function main(): Promise<void> {
  const recipient = await prisma.user.findFirst({
    where: { isActive: true },
    select: { id: true }
  });

  if (!recipient) {
    throw new Error("Queue verification requires at least one active user");
  }

  const eventId = `queue-smoke-${randomUUID()}`;
  const event = {
    eventId,
    type: NotificationEventType.APPOINTMENT_COMPLETED,
    resourceId: eventId,
    resourceTitle: "Queue verification",
    studentUserId: recipient.id,
    targetType: "OFFICE" as const
  };

  await enqueueNotificationEvent(event);
  await waitForNotification(recipient.id, eventId);

  await enqueueNotificationEvent(event);
  await new Promise((resolve) => setTimeout(resolve, 500));

  const count = await prisma.notification.count({
    where: { userId: recipient.id, eventKey: eventId }
  });

  if (count !== 1) {
    throw new Error(`Expected one idempotent notification, found ${count}`);
  }

  await prisma.notification.deleteMany({
    where: { userId: recipient.id, eventKey: eventId }
  });

  console.log("Notification queue delivery and idempotency verified");
}

async function waitForNotification(userId: string, eventKey: string): Promise<void> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const notification = await prisma.notification.findFirst({
      where: { userId, eventKey },
      select: { id: true }
    });

    if (notification) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error("Notification worker did not process the verification event");
}

void main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeNotificationQueue();
    await disconnectRedis();
    await prisma.$disconnect();
    process.exit(process.exitCode ?? 0);
  });
