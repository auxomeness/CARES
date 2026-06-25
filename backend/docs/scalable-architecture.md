# CARES Scalable Architecture

CARES remains a modular monolith. The API and notification worker are separate
processes built from the same backend codebase and deployed from the same image.

## Runtime Topology

```text
React frontend
      |
      v
CARES Express API ----> PostgreSQL
      |                     ^
      v                     |
Redis / BullMQ ------> Notification worker
      |
      +---- directory cache
```

PostgreSQL remains the source of truth. Redis is disposable infrastructure used
for asynchronous jobs and short-lived directory cache entries.

## Notification Delivery

1. Concern and appointment services publish domain events after their database
   transactions complete.
2. The API enqueues the event in BullMQ and returns without waiting for
   notification creation.
3. The worker resolves recipients and inserts notifications.
4. Jobs retry with exponential backoff.
5. `eventKey` plus recipient is unique, making worker retries idempotent.
6. If queue publication fails, the API logs the failure and performs direct
   delivery so the main business operation is never rolled back.

Set `NOTIFICATION_QUEUE_ENABLED=true` and run `npm run start:worker` in
production. Set `NOTIFICATION_QUEUE_REQUIRED=true` to make an API deployment
fail fast when Redis configuration is absent.

## Caching

Faculty, office, and department directory responses are cached in Redis by
search and pagination parameters. Mutating those resources invalidates the
related cache keys. Cache failures are logged and queries fall back to
PostgreSQL.

## Operations

- `GET /health` is the liveness endpoint.
- `GET /metrics` exposes Prometheus metrics when `METRICS_TOKEN` is configured.
  Send `Authorization: Bearer <METRICS_TOKEN>`.
- Requests are compressed and have a configurable server timeout.
- Login and student submission endpoints have dedicated rate limits.
- Pino logs redact credentials and record important business actions.

## Production Deployment

Deploy the API and worker as separate services using the same Docker image:

```bash
node dist/server.js
node dist/workers/notification.worker.js
```

Use a pooled PostgreSQL connection URL from PgBouncer, Supabase pooler, or Neon
pooler for horizontally scaled API instances. Use managed Redis such as Upstash
or Redis Cloud. Do not expose Redis publicly.

For larger installations, scale API and worker replicas independently. Database
partitioning, Kafka, and microservices should only be introduced after measured
load demonstrates a need.
