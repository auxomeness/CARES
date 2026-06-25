# CARES Backend Production Readiness

Version: `1.0.0`

## Integration Verification

- Authentication protects users, directory, concerns, appointments,
  availability, and notification APIs.
- Every authenticated request verifies JWT signature, expiration, issuer,
  audience, active user state, and current role.
- Concern submission, transfer, resolution, reopening, and support publish
  notification events.
- Appointment creation, approval, rejection, cancellation, rescheduling, and
  completion publish notification events.
- Notification events use Redis and BullMQ when enabled. Queue publication and
  persistence failures are logged and do not fail the originating workflow.
- Notification jobs use retry backoff and recipient/event idempotency.
- Dean and chair access is department-scoped. Office staff access is
  office-scoped. Professor appointment access is faculty-scoped.

## Security Audit

- Helmet is enabled globally.
- CORS uses the comma-separated `CORS_ORIGIN` allowlist.
- Global, login-specific, and student-submission rate limits return
  standardized JSON errors.
- Request logging excludes authorization headers, cookies, passwords, and
  tokens.
- JWTs contain only user ID and role. HS256, issuer, audience, and expiration
  are verified.
- Login returns the same invalid-credentials error for unknown users and
  incorrect passwords.
- Zod strips unknown request fields, preventing mass assignment.
- User-creation passwords require 12 to 72 characters.
- Prisma errors are normalized and raw database messages are not returned.
- Responses are compressed and requests have a configurable timeout.
- Operational metrics require a dedicated bearer token.

## Performance

- All database-backed lists use page and limit pagination.
- Directory lists now return standardized pagination metadata.
- Concern, appointment, notification, user, and target indexes cover frequent
  filters.
- Appointment exclusion constraints prevent concurrent overlapping bookings.
- Repositories use Prisma `select` for compact directory, authentication, and
  recipient-resolution queries.
- Faculty, office, and department directories use a Redis read-through cache
  with mutation invalidation.

## Automated Tests

Run from `backend/`:

```bash
npm run test:unit
npm run test:integration
npm run test:coverage
npm run verify:queue
```

Coverage includes:

- Auth service success and invalid credentials
- Concern targeting and status transition enforcement
- Appointment availability and target authorization
- Notification creation and ownership
- Invalid and expired JWT handling
- Validation and RBAC errors
- Directory pagination and CORS
- Full concern lifecycle with notifications
- Full appointment lifecycle and conflict prevention

Integration tests require a migrated and seeded PostgreSQL database. Queue
verification additionally requires Redis and a running notification worker.

## Database Checks

```bash
npm run prisma:generate
npx prisma migrate deploy
npm run prisma:seed
npm run prisma:check
```

The integrity script checks profile-role consistency, target XOR invariants,
and resolution-report consistency.

## Deployment

Local containers:

```bash
docker compose up -d postgres redis
docker compose run --rm api npx prisma migrate deploy
docker compose up --build api notification-worker
```

Before production deployment:

1. Replace all example secrets.
2. Set `CORS_ORIGIN` to the deployed frontend origins.
3. Configure PostgreSQL backups and TLS.
4. Use a pooled PostgreSQL URL for horizontally scaled API instances.
5. Configure managed Redis with TLS and no public network access.
6. Configure Supabase Storage credentials when attachments are enabled.
7. Run `npx prisma migrate deploy` as a release step.
8. Run the CI workflow successfully.

## Required Environment

```text
NODE_ENV=production
PORT=3000
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=
JWT_ISSUER=cares-api
JWT_AUDIENCE=cares-client
CORS_ORIGIN=
REDIS_URL=
NOTIFICATION_QUEUE_ENABLED=true
NOTIFICATION_QUEUE_REQUIRED=true
DIRECTORY_CACHE_TTL_SECONDS=300
REQUEST_TIMEOUT_MS=15000
METRICS_TOKEN=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_BUCKET=
```

## Remaining Operational Decisions

- Hosting provider and managed PostgreSQL vendor
- Domain and TLS termination
- Log aggregation and alerting destination
- Prometheus scraper and dashboard destination
- Error-tracking vendor such as Sentry
- Backup retention and recovery objectives
- Supabase bucket privacy and signed URL policy
