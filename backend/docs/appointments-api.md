# CARES Appointment API

Base path: `/api/v1`

All endpoints require `Authorization: Bearer <accessToken>`.

Availability calculations use `Asia/Manila`. `dayOfWeek` uses ISO weekday
numbers: Monday is `1` and Sunday is `7`.

## Create Availability

`POST /availability`

Office staff automatically create availability for their office. Deans and
chairs default to their department. Professors create availability for their
faculty profile.

```json
{
  "dayOfWeek": 1,
  "startTime": "09:00",
  "endTime": "12:00",
  "slotDuration": 30,
  "isActive": true
}
```

Administrators must explicitly provide `targetType` and the matching target ID.
Deans and chairs may provide `targetType: "PROFESSOR"` to create their own
consultation availability.

```json
{
  "success": true,
  "message": "Availability schedule created successfully",
  "data": {
    "availability": {
      "id": "availability-cuid",
      "targetType": "OFFICE",
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "12:00",
      "slotDuration": 30
    }
  }
}
```

## Get Weekly Availability

`GET /availability/:ownerId?targetType=OFFICE`

`ownerId` is an office, department, or faculty profile ID. `targetType` is
optional for weekly schedule retrieval.

## Get Bookable Slots

`GET /availability/:ownerId/slots?targetType=OFFICE&date=2026-07-08`

```json
{
  "success": true,
  "message": "Bookable slots retrieved successfully",
  "data": {
    "slots": [
      {
        "startTime": "2026-07-08T01:00:00.000Z",
        "endTime": "2026-07-08T01:30:00.000Z"
      }
    ]
  }
}
```

Reserved `PENDING`, `APPROVED`, and `RESCHEDULED` appointments are removed from
the generated slots.

## Update Availability

`PATCH /availability/:id`

```json
{
  "startTime": "10:00",
  "endTime": "15:00",
  "slotDuration": 30,
  "isActive": true
}
```

## Delete Availability

`DELETE /availability/:id`

Only a handler belonging to the target entity or an administrator can update
or delete an availability schedule.

## Request Appointment

`POST /appointments`

```json
{
  "title": "Portal access consultation",
  "description": "I need help accessing the student portal.",
  "targetType": "OFFICE",
  "officeId": "office-cuid",
  "departmentId": null,
  "facultyId": null,
  "startTime": "2026-07-08T01:00:00.000Z",
  "endTime": "2026-07-08T01:30:00.000Z"
}
```

Exactly one matching target is required. The requested interval must match an
active availability slot. New appointments start as `PENDING`.

```json
{
  "success": true,
  "message": "Appointment requested successfully",
  "data": {
    "appointment": {
      "id": "appointment-cuid",
      "status": "PENDING"
    }
  }
}
```

## List Appointments

`GET /appointments?page=1&limit=20&status=PENDING`

Optional filters:

- `search`
- `status`
- `studentId`
- `officeId`
- `departmentId`
- `facultyId`
- `startFrom`
- `startTo`

Results are automatically scoped to the authenticated student, office,
department, or faculty member.

## Get Appointment

`GET /appointments/:id`

The response includes student and target details plus the full reschedule
history.

## Approve Appointment

`PATCH /appointments/:id/approve`

Allowed from `PENDING` or `RESCHEDULED`. The authenticated handler must belong
to the appointment target.

## Reject Appointment

`PATCH /appointments/:id/reject`

```json
{
  "reason": "The requested time conflicts with a department meeting."
}
```

```json
{
  "success": true,
  "message": "Appointment rejected successfully",
  "data": {
    "appointment": {
      "status": "REJECTED",
      "rejectionReason": "The requested time conflicts with a department meeting."
    }
  }
}
```

## Cancel Appointment

`PATCH /appointments/:id/cancel`

The student who created the appointment or an administrator can cancel a
`PENDING`, `APPROVED`, or `RESCHEDULED` appointment.

## Reschedule Appointment

`POST /appointments/:id/reschedule`

```json
{
  "newStartTime": "2026-07-08T02:00:00.000Z",
  "newEndTime": "2026-07-08T02:30:00.000Z",
  "reason": "Student requested a later slot."
}
```

The new slot is validated against availability and conflicts. The previous and
new time ranges are stored in `AppointmentReschedule`, and status becomes
`RESCHEDULED` pending handler approval.

## Complete Appointment

`PATCH /appointments/:id/complete`

Only the target handler or an administrator can complete an `APPROVED`
appointment.

## Conflict Rules

The API and PostgreSQL both prevent overlaps for active appointments:

- A student cannot hold overlapping appointments across different targets.
- An office cannot accept overlapping active appointments.
- A department cannot accept overlapping active appointments.
- A faculty member cannot accept overlapping active appointments.

Conflicts return:

```json
{
  "success": false,
  "message": "Time slot not available",
  "errors": []
}
```
