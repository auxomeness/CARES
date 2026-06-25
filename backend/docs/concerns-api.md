# CARES Concern API

Base path: `/api/v1`

All endpoints require `Authorization: Bearer <accessToken>`.

## Submit Concern

`POST /concerns`

```json
{
  "title": "Portal access issue",
  "description": "I cannot access the student portal.",
  "targetType": "OFFICE",
  "targetOfficeId": "office-cuid",
  "targetDepartmentId": null,
  "visibility": "PRIVATE"
}
```

```json
{
  "success": true,
  "message": "Concern submitted successfully",
  "data": {
    "concern": {
      "id": "concern-cuid",
      "referenceNumber": "CARES-20260624-A1B2C3",
      "status": "SUBMITTED"
    }
  }
}
```

The student must select exactly one matching office or department target.

## List Concerns

`GET /concerns?page=1&limit=20&status=SUBMITTED&targetType=OFFICE`

Optional filters: `search`, `status`, `targetType`, `targetOfficeId`, and
`targetDepartmentId`.

```json
{
  "success": true,
  "message": "Concerns retrieved successfully",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0
  }
}
```

Results are automatically scoped to the authenticated student, office, or
department. Administrators can view all concerns.

## Get Concern

`GET /concerns/:id`

```json
{
  "success": true,
  "message": "Concern retrieved successfully",
  "data": {
    "concern": {
      "id": "concern-cuid",
      "attachments": [],
      "timeline": [],
      "transfers": [],
      "resolutionReport": null
    }
  }
}
```

## Update Status

`PATCH /concerns/:id/status`

```json
{
  "status": "UNDER_REVIEW"
}
```

Allowed direct handler updates are `UNDER_REVIEW` and `IN_PROGRESS`.
`CLOSED` is restricted to administrators.

## Add Image

`POST /concerns/:id/attachments`

Send `multipart/form-data` with one `image` field.

```json
{
  "success": true,
  "message": "Concern image uploaded successfully",
  "data": {
    "attachment": {
      "id": "attachment-cuid",
      "mimeType": "image/png",
      "fileSize": 248120
    }
  }
}
```

Supported formats are JPEG, PNG, WebP, and GIF, with a 5 MB maximum.

## Support Public Concern

`POST /concerns/:id/support`

```json
{
  "success": true,
  "message": "Concern support recorded successfully",
  "data": {
    "support": {
      "id": "support-cuid"
    }
  }
}
```

Only students can support public concerns, once per concern. A student cannot
support their own concern.

## Get Timeline

`GET /concerns/:id/timeline`

```json
{
  "success": true,
  "message": "Concern timeline retrieved successfully",
  "data": {
    "timeline": [
      {
        "eventType": "SUBMITTED",
        "description": "Concern submitted"
      }
    ]
  }
}
```

## Transfer Concern

`POST /concerns/:id/transfer`

```json
{
  "toTargetType": "DEPARTMENT",
  "toOfficeId": null,
  "toDepartmentId": "department-cuid",
  "reason": "Requires academic department review."
}
```

The concern target and status are updated atomically, and a transfer and
timeline record are created.

## Submit Resolution

`POST /concerns/:id/resolution`

```json
{
  "summary": "Portal access restored",
  "actionsTaken": "Removed the account lock and verified login.",
  "evidenceUrl": "https://example.com/evidence.png"
}
```

```json
{
  "success": true,
  "message": "Resolution report submitted successfully",
  "data": {
    "concern": {
      "status": "AWAITING_CONFIRMATION"
    }
  }
}
```

## Confirm Resolution

`POST /concerns/:id/confirm`

```json
{
  "success": true,
  "message": "Resolution confirmed successfully",
  "data": {
    "concern": {
      "status": "RESOLVED"
    }
  }
}
```

Only the student who submitted the concern can confirm it.

## Reject Resolution

`POST /concerns/:id/reject`

```json
{
  "reason": "I still cannot access the portal."
}
```

```json
{
  "success": true,
  "message": "Resolution rejected and concern reopened",
  "data": {
    "concern": {
      "status": "REOPENED"
    }
  }
}
```
