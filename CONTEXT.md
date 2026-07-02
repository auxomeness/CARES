# CARES Context

CARES is the Centralized Ateneo Response and Engagement System. It is a role-based university operations app for concern management, appointment scheduling, directory lookup, notification history, and staff/admin workflow.

## Architecture Decisions

- CARES uses a modular monolith backend with Express, Prisma, PostgreSQL, Redis/BullMQ, and JWT auth.
- The frontend uses React Query as the server-state module.
- The first performance pass optimizes perceived speed only: cached data, canonical query keys, bootstrap hydration, optimistic low-risk updates, and immediate pressed/loading feedback.
- Full realtime infrastructure is deferred. CARES does not currently have a frontend realtime transport like Supabase Realtime, SSE, or WebSocket.
- Low-risk state may update optimistically: button state, counters, list insertion, read/unread state, and user-visible local patches.
- High-risk workflow state waits for server confirmation: appointment approval/rejection/completion, concern status, resolution, transfers, account changes, and admin changes.

## Vocabulary

- Concern: a student-submitted issue routed to an office or department.
- Public concern: a visible concern that other students can support.
- Appointment: a scheduled request with an office, department, or professor.
- Directory: offices, departments, faculty, and students exposed through role-scoped screens.
- Bootstrap: the authenticated startup payload that hydrates user, notifications, directory slices, concerns, appointments, and public feed data.
- Perceived speed: the user sees existing data and click feedback immediately while network refreshes happen in the background.
