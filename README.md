# CARES

CARES, or Centralized Ateneo Response and Engagement System, is a university-wide platform for concern management and appointment scheduling.

The system centralizes communication between students, university offices, academic departments, deans, chairs, and professors. CARES is not an ERP or LMS. Its focus is concern reporting, appointment scheduling, university directory data, resolution tracking, and role-based access control.

## Version

0.1.0

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

The backend is currently implemented. The frontend folder is intentionally empty for now and is reserved for the future CARES client application.

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

The following modules are scaffolded for future implementation:

- Users
- Offices
- Departments
- Faculty
- Concerns
- Appointments
- Notifications

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
```

Start the backend development server:

```bash
npm run dev
```

## Backend Scripts

Run these from `backend/`:

```bash
npm run dev
npm run build
npm run start
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

## License

This project includes a `LICENSE` file. The current license file is GNU General Public License v3.0.
