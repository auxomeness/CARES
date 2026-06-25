# CARES Backend and Frontend Integration Audit

## Backend Audit

The backend is a feature-based modular monolith. Every module uses controller,
service, repository, route, validator, and type boundaries where applicable.

| Module | Routes | Controllers / Services / Repositories | Frontend Integration |
| --- | --- | --- | --- |
| Auth | `POST /auth/login`, `POST /auth/register`, `GET /auth/departments`, `GET /auth/me` | Implemented | Login, registration, session restoration |
| Users | `GET /users/me`, `PUT /users/me` | Implemented | Account panel and profile editing |
| Offices | `GET /offices`, `GET /offices/:id`, `POST /offices`, `PUT /offices/:id`, `DELETE /offices/:id` | Implemented | Directory and admin CRUD |
| Departments | `GET /departments`, `GET /departments/:id`, `POST /departments`, `PUT /departments/:id`, `DELETE /departments/:id` | Implemented | Directory, registration, admin CRUD |
| Faculty | `GET /faculty`, `GET /faculty/:id`, `POST /faculty`, `PUT /faculty/:id`, `DELETE /faculty/:id` | Implemented | Directory and admin management |
| Students | `GET /students`, `GET /students/:id`, `POST /students`, `PUT /students/:id`, `DELETE /students/:id` | Implemented | Department/admin authorized reads |
| Directory | `GET /directory/offices`, `GET /directory/departments`, `GET /directory/faculty` | Implemented | Searchable target lists |
| Concerns | list, public feed, detail, create, timeline, attachment, support, transfer, resolution, confirm/reject, status | Implemented | Student and staff workspaces |
| Appointments | list, detail, create, approve, reject, cancel, reschedule, complete | Implemented | Student and staff workspaces |
| Availability | create, list, bookable slots, update, delete | Implemented | Booking and staff schedule management |
| Notifications | list, read, unread, read-all, delete | Implemented | Global notification panel |

Prisma models: `User`, `StudentProfile`, `FacultyProfile`,
`OfficeStaffProfile`, `Office`, `Department`, `Concern`,
`ConcernAttachment`, `ConcernSupport`, `ConcernTimeline`,
`ConcernTransfer`, `ResolutionReport`, `ReopenRequest`, `Appointment`,
`AppointmentAvailability`, `AppointmentReschedule`, and `Notification`.

Global middleware includes JWT authentication, RBAC authorization, Zod request
validation, global error normalization, Pino request logging, rate limiting,
request timeout, metrics, CORS, Helmet, and compression.

## RBAC Summary

| Role | Backend Scope |
| --- | --- |
| `STUDENT` | Own concerns and appointments, public support, resolution validation, directories |
| `OFFICE_STAFF` | Assigned office concerns, appointments, availability |
| `DEAN`, `CHAIR` | Department concerns, department/faculty appointments, department students |
| `PROFESSOR` | Personal consultations and availability |
| `ADMIN` | Full directory and workflow access |

## Frontend Audit

| Page group | Routes | Backend APIs | Mock data |
| --- | --- | --- | --- |
| Authentication | `#login`, `#register` | Auth login/register/departments | Removed |
| Student dashboard | `#student` | Appointments, notifications | Removed |
| Public feed | `#student-feed` | Public concerns and support | Removed |
| Student concerns | `#student-concerns`, `#student-concern-new` | Concern CRUD workflow, attachments, confirmation | Removed |
| Student appointments | `#student-appointments`, `#student-appointment-new` | Appointment create/list/cancel/reschedule | Removed |
| Directories | `#student-directories-*` | Office, department, faculty list/detail | Removed |
| Office workspace | `#office*` | Scoped concerns, appointments, availability | Removed |
| Department workspace | `#department*` | Scoped concerns, appointments, availability, faculty/students | Removed |
| Faculty workspace | `#faculty*` | Consultations and availability | Removed |
| Admin workspace | `#admin*` | Live totals and office/department/faculty/student CRUD | Removed |
| Account / notifications | all authenticated pages | User profile and notifications | Removed |

The frontend uses one Axios instance in `src/lib/api.ts`. It injects the JWT,
normalizes API errors, handles `401` globally, and uses a 15-second timeout.
React Query owns server state, loading, empty, error, and cache invalidation
behavior.

## API Mapping

| Frontend capability | API |
| --- | --- |
| Login / restore / logout | `POST /auth/login`, `GET /users/me`, local token removal |
| Register student | `GET /auth/departments`, `POST /auth/register` |
| Edit profile | `PUT /users/me` |
| Submit concern and image | `POST /concerns`, `POST /concerns/:id/attachments` |
| Track and validate concern | `GET /concerns`, `GET /concerns/:id`, confirm/reject routes |
| Community support | `GET /concerns/public`, `POST /concerns/:id/support` |
| Staff concern handling | status, transfer, and resolution routes |
| Book appointment | directory APIs and `POST /appointments` |
| Manage booking | list, approve, reject, cancel, reschedule, complete routes |
| Manage availability | `POST /availability` and availability read routes |
| Notifications | list, read, read-all, delete routes |
| Admin directory | office, department, faculty, and student CRUD routes |

## Contract Decisions

- CARES remains stateless access-token JWT authentication. A refresh token was
  not added because the backend has no refresh-token/session persistence model.
  Session restoration verifies the current access token with `GET /users/me`.
- Submitted concerns are immutable; the UI no longer presents unsupported edit
  or delete actions.
- Separate aggregate report documents are not a backend feature. Report pages
  show live concern resolution history instead of simulating report submission.
