import { randomUUID } from "node:crypto";

import { env } from "../../../config/env";
import { logger } from "../../../shared/utils/logger";
import { notificationRepository } from "../repository/notification.repository";
import { NotificationDomainEvent, NotificationEventType } from "../types/notification.types";
import { notificationService } from "./notification.service";
import { enqueueNotificationEvent } from "./notification.queue";

export function publishNotificationEvent(event: NotificationDomainEvent): void {
  const deliveryEvent = {
    ...event,
    eventId: event.eventId ?? randomUUID()
  };

  setImmediate(() => {
    void deliverNotificationEvent(deliveryEvent).catch((error: unknown) => {
      logger.error(
        {
          error,
          notificationEvent: deliveryEvent.type,
          resourceId: deliveryEvent.resourceId,
          eventId: deliveryEvent.eventId
        },
        "Notification event delivery failed"
      );
    });
  });
}

async function deliverNotificationEvent(event: NotificationDomainEvent): Promise<void> {
  if (!env.NOTIFICATION_QUEUE_ENABLED) {
    await handleNotificationEvent(event);
    return;
  }

  try {
    await enqueueNotificationEvent(event);
  } catch (error) {
    logger.error(
      { error, notificationEvent: event.type, eventId: event.eventId },
      "Notification queue publish failed; using direct fallback"
    );
    await handleNotificationEvent(event);
  }
}

export async function handleNotificationEvent(event: NotificationDomainEvent): Promise<void> {
  const handlerUserIds = eventNeedsTargetHandlers(event.type)
    ? await notificationRepository.findTargetHandlerUserIds(event)
    : [];
  const recipients = recipientsForEvent(event, handlerUserIds);
  const content = contentForEvent(event);

  await notificationService.createNotifications(recipients, {
    ...content,
    eventKey: event.eventId
  });
}

function eventNeedsTargetHandlers(type: NotificationEventType): boolean {
  return [
    NotificationEventType.CONCERN_SUBMITTED,
    NotificationEventType.CONCERN_TRANSFERRED,
    NotificationEventType.CONCERN_REOPENED,
    NotificationEventType.APPOINTMENT_CREATED,
    NotificationEventType.APPOINTMENT_RESCHEDULED,
    NotificationEventType.APPOINTMENT_CANCELLED
  ].includes(type);
}

function recipientsForEvent(event: NotificationDomainEvent, handlerUserIds: string[]): string[] {
  switch (event.type) {
    case NotificationEventType.CONCERN_SUBMITTED:
    case NotificationEventType.CONCERN_REOPENED:
    case NotificationEventType.APPOINTMENT_CREATED:
      return handlerUserIds;

    case NotificationEventType.CONCERN_TRANSFERRED:
    case NotificationEventType.APPOINTMENT_RESCHEDULED:
    case NotificationEventType.APPOINTMENT_CANCELLED:
      return [...handlerUserIds, ...(event.studentUserId ? [event.studentUserId] : [])];

    case NotificationEventType.CONCERN_RESOLVED:
    case NotificationEventType.CONCERN_SUPPORT_ADDED:
    case NotificationEventType.APPOINTMENT_APPROVED:
    case NotificationEventType.APPOINTMENT_REJECTED:
    case NotificationEventType.APPOINTMENT_COMPLETED:
      return event.studentUserId ? [event.studentUserId] : [];
  }
}

function contentForEvent(event: NotificationDomainEvent): { title: string; message: string } {
  const reference = event.referenceNumber ? ` ${event.referenceNumber}` : "";
  const schedule = event.startTime ? ` for ${formatSchedule(event.startTime)}` : "";

  switch (event.type) {
    case NotificationEventType.CONCERN_SUBMITTED:
      return {
        title: "New concern submitted",
        message: `Concern${reference} "${event.resourceTitle}" was assigned to your queue.`
      };
    case NotificationEventType.CONCERN_TRANSFERRED:
      return {
        title: "Concern transferred",
        message: `Concern${reference} "${event.resourceTitle}" was transferred to a new target.`
      };
    case NotificationEventType.CONCERN_RESOLVED:
      return {
        title: "Concern resolution submitted",
        message: `A resolution was submitted for concern${reference} "${event.resourceTitle}". Please confirm whether it is fixed.`
      };
    case NotificationEventType.CONCERN_REOPENED:
      return {
        title: "Concern reopened",
        message: `Concern${reference} "${event.resourceTitle}" was reopened by the student${event.reason ? `: ${event.reason}` : "."}`
      };
    case NotificationEventType.CONCERN_SUPPORT_ADDED:
      return {
        title: "Concern received support",
        message: `Another student is also experiencing concern${reference} "${event.resourceTitle}".`
      };
    case NotificationEventType.APPOINTMENT_CREATED:
      return {
        title: "New appointment request",
        message: `A new appointment "${event.resourceTitle}" was requested${schedule}.`
      };
    case NotificationEventType.APPOINTMENT_APPROVED:
      return {
        title: "Appointment approved",
        message: `Your appointment "${event.resourceTitle}"${schedule} was approved.`
      };
    case NotificationEventType.APPOINTMENT_REJECTED:
      return {
        title: "Appointment rejected",
        message: `Your appointment "${event.resourceTitle}" was rejected${event.reason ? `: ${event.reason}` : "."}`
      };
    case NotificationEventType.APPOINTMENT_RESCHEDULED:
      return {
        title: "Appointment rescheduled",
        message: `Appointment "${event.resourceTitle}" was rescheduled${schedule}.`
      };
    case NotificationEventType.APPOINTMENT_CANCELLED:
      return {
        title: "Appointment cancelled",
        message: `Appointment "${event.resourceTitle}"${schedule} was cancelled.`
      };
    case NotificationEventType.APPOINTMENT_COMPLETED:
      return {
        title: "Appointment completed",
        message: `Your appointment "${event.resourceTitle}" was marked completed.`
      };
  }
}

function formatSchedule(value: Date | string): string {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
