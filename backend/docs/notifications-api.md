# CARES Notification API

Base path: `/api/v1`

All endpoints require `Authorization: Bearer <accessToken>`. Users can only
access their own notifications.

## Event Types

The notification layer defines these typed application events:

```text
CONCERN_SUBMITTED
CONCERN_TRANSFERRED
CONCERN_RESOLVED
CONCERN_REOPENED
CONCERN_SUPPORT_ADDED

APPOINTMENT_CREATED
APPOINTMENT_APPROVED
APPOINTMENT_REJECTED
APPOINTMENT_RESCHEDULED
APPOINTMENT_CANCELLED
APPOINTMENT_COMPLETED
```

The existing Prisma `Notification` model stores the generated `title` and
`message`. Event types remain application metadata so the schema stays
consistent with the established notification entity.

## Get Notifications

`GET /notifications?page=1&limit=20&isRead=false`

Optional filters:

- `isRead=true|false`
- `startDate=<ISO date-time>`
- `endDate=<ISO date-time>`

Results are ordered by `createdAt DESC`.

```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": [
    {
      "id": "notification-cuid",
      "userId": "user-cuid",
      "title": "Appointment approved",
      "message": "Your appointment \"MIS consultation\" was approved.",
      "isRead": false,
      "createdAt": "2026-06-25T04:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "unread": 1
  }
}
```

## Mark As Read

`PATCH /notifications/:id/read`

```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "notification": {
      "id": "notification-cuid",
      "isRead": true
    }
  }
}
```

## Mark As Unread

`PATCH /notifications/:id/unread`

```json
{
  "success": true,
  "message": "Notification marked as unread",
  "data": {
    "notification": {
      "id": "notification-cuid",
      "isRead": false
    }
  }
}
```

## Mark All As Read

`PATCH /notifications/read-all`

```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": {
    "updatedCount": 8
  }
}
```

## Delete Notification

`DELETE /notifications/:id`

Notifications use hard deletion. A user cannot delete another user's
notification.

```json
{
  "success": true,
  "message": "Notification deleted successfully",
  "data": {
    "notification": {
      "id": "notification-cuid"
    }
  }
}
```

## Recipient Rules

Concern events:

- Submission notifies the assigned office staff or department dean and chair.
- Transfer notifies the new target and the submitting student.
- Resolution submission notifies the student for confirmation.
- Reopening notifies the currently assigned handlers.
- Added support notifies the concern owner.

Appointment events:

- Creation notifies the target office, department, or faculty member.
- Approval, rejection, and completion notify the student.
- Rescheduling and cancellation notify both the student and target handlers.

## Failure Isolation

Business services publish events after their primary transaction succeeds.
Notification processing is scheduled asynchronously. Persistence errors are
logged with Pino and are not returned through the concern or appointment
request.

The event publisher is intentionally transport-independent so WebSocket,
email, and push delivery can be added later without changing concern or
appointment business logic.
