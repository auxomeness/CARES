# CARES

CARES, or Centralized Ateneo Response and Engagement System, is a university-wide platform for concern management and appointment scheduling.

The system centralizes communication between students, university offices, academic departments, deans, chairs, and professors. CARES is not an ERP or LMS. Its focus is concern reporting, appointment scheduling, university directory data, resolution tracking, and role-based access control.

## Version

1.0.1

## Author

Karl Austin Pavia

## Repository Structure

```text
CARES/
├── backend/
│   ├── prisma/
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
├── LICENSE
└── README.md
```

The repository contains the CARES backend and React frontend applications.

For the complete native PostgreSQL and application startup sequence, see
[RUN-LOCAL.md](./RUN-LOCAL.md).

## Backend Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma
- JWT authentication
- bcrypt password hashing
- Zod validation
- Pino logging
- Helmet, CORS, and Express Rate Limit
- Redis, BullMQ, response compression, and Prometheus metrics

## Current Backend Scope

The backend currently includes:

- Production-ready Express application foundation
- Prisma database schema
- Initial database migration
- Development seed data
- JWT login system
- Current-user endpoint
- Authentication middleware
- Role-based authorization middleware
- Standardized API responses
- Centralized error handling
- Request logging
- University directory CRUD, pagination, and search
- Concern submission with explicit office or department targeting
- Role-scoped concern queues
- Concern status transitions and transfers
- Supabase Storage image attachments
- Public concern support
- Resolution reports and student confirmation/rejection
- Complete concern timeline audit history
- Office, department, and professor appointment booking
- Entity-owned recurring availability schedules
- Generated bookable calendar slots
- Appointment approval, rejection, cancellation, and completion
- Appointment rescheduling with history
- Service and database-level overlap prevention
- Event-driven concern and appointment notifications
- Paginated notification history with read/unread filters
- Notification read, unread, read-all, and deletion controls
- Failure-isolated notification delivery
- Redis-backed notification queue and independent worker process
- Redis directory caching with mutation invalidation
- Request timeout handling and protected operational metrics

All planned backend feature modules are now implemented.

The backend includes automated unit and integration tests, Docker deployment
support, PostgreSQL integrity checks, and GitHub Actions CI.

## Roles

CARES supports these roles:

- ADMIN
- STUDENT
- OFFICE_STAFF
- DEAN
- CHAIR
- PROFESSOR

## Backend Setup

Go to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create an environment file:

```bash
cp .env.example .env
```

Required environment variables:

```bash
PORT=
NODE_ENV=
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=
CORS_ORIGIN=
REDIS_URL=
NOTIFICATION_QUEUE_ENABLED=
NOTIFICATION_QUEUE_REQUIRED=
DIRECTORY_CACHE_TTL_SECONDS=
REQUEST_TIMEOUT_MS=
METRICS_TOKEN=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_BUCKET=
```

Run Prisma migration:

```bash
npm run prisma:migrate
```

Seed development data:

```bash
npm run prisma:seed
npm run prisma:check
npm test
npm run test:coverage
```

Start the backend development server:

```bash
npm run dev
```

## Backend Scripts

Run these from `backend/`:

```bash
npm run dev
npm run dev:worker
npm run build
npm run start
npm run start:worker
npm run lint
npm run format
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## API Health Check

```text
GET /health
```

Expected response:

```json
{
  "success": true,
  "message": "CARES API is healthy",
  "data": {
    "status": "ok"
  }
}
```

## Authentication Endpoints

```text
POST /auth/login
GET /auth/me
```

The API also exposes versioned auth routes:

```text
POST /api/v1/auth/login
GET /api/v1/auth/me
```

## Concern Endpoints

All concern endpoints require a bearer token. Versioned routes use `/api/v1`.

```text
POST   /api/v1/concerns
GET    /api/v1/concerns
GET    /api/v1/concerns/:id
PATCH  /api/v1/concerns/:id/status
POST   /api/v1/concerns/:id/attachments
POST   /api/v1/concerns/:id/support
GET    /api/v1/concerns/:id/timeline
POST   /api/v1/concerns/:id/transfer
POST   /api/v1/concerns/:id/resolution
POST   /api/v1/concerns/:id/confirm
POST   /api/v1/concerns/:id/reject
```

Concern submission uses manual target selection. Automatic routing is not implemented.

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

Image attachment requests use `multipart/form-data` with one `image` field. Supported
types are JPEG, PNG, WebP, and GIF up to 5 MB.

Resolution submission:

```json
{
  "summary": "Portal account access restored",
  "actionsTaken": "Reset the account lock and verified successful login.",
  "evidenceUrl": "https://example.com/evidence.png"
}
```

Transfer submission:

```json
{
  "toTargetType": "DEPARTMENT",
  "toOfficeId": null,
  "toDepartmentId": "department-cuid",
  "reason": "This concern requires academic department review."
}
```

The seeded `office.staff@adnu.edu.ph` account is assigned to the MIS office. All
development seed accounts use `password123`.

Complete request and response examples are available in
[`backend/docs/concerns-api.md`](backend/docs/concerns-api.md).

## Appointment Endpoints

```text
POST   /api/v1/appointments
GET    /api/v1/appointments
GET    /api/v1/appointments/:id
PATCH  /api/v1/appointments/:id/approve
PATCH  /api/v1/appointments/:id/reject
PATCH  /api/v1/appointments/:id/cancel
POST   /api/v1/appointments/:id/reschedule
PATCH  /api/v1/appointments/:id/complete

POST   /api/v1/availability
GET    /api/v1/availability/:ownerId
GET    /api/v1/availability/:ownerId/slots
PATCH  /api/v1/availability/:id
DELETE /api/v1/availability/:id
```

Availability and slot generation use the `Asia/Manila` timezone. Weekly schedules
use ISO weekdays where Monday is `1` and Sunday is `7`.

Complete appointment examples are available in
[`backend/docs/appointments-api.md`](backend/docs/appointments-api.md).

## Notification Endpoints

```text
GET    /api/v1/notifications
PATCH  /api/v1/notifications/read-all
PATCH  /api/v1/notifications/:id/read
PATCH  /api/v1/notifications/:id/unread
DELETE /api/v1/notifications/:id
```

Concern and appointment services publish typed notification events only after
their primary database operations succeed. With Redis enabled, notification
delivery runs through BullMQ and the independent worker. Failures are logged
without failing the originating workflow.

Complete notification examples are available in
[`backend/docs/notifications-api.md`](backend/docs/notifications-api.md).

The production runtime topology and scaling guidance are documented in
[`backend/docs/scalable-architecture.md`](backend/docs/scalable-architecture.md).

The full backend/frontend route audit and API mapping are documented in
[`docs/integration-audit.md`](docs/integration-audit.md).

## License

This project includes a `LICENSE` file. The current license file is GNU General Public License v3.0.
