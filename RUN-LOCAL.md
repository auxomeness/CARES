# Run CARES Locally

This is the required startup sequence for a development computer.

Docker is optional. The primary setup below uses a native PostgreSQL 16
installation and runs both Node.js applications directly.

## 1. Prerequisites

Install:

- Git
- Node.js 22 LTS or newer
- npm 10 or newer
- PostgreSQL 16

Redis is not required for normal local development. Supabase credentials are
only required when testing image uploads.

### macOS

```bash
brew install postgresql@16
brew services start postgresql@16
```

If `psql` is not found:

```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Windows

Install PostgreSQL 16 from:

```text
https://www.postgresql.org/download/windows/
```

During installation:

- Keep port `5432`.
- Remember the password assigned to the `postgres` administrator.
- Install Command Line Tools.
- Add PostgreSQL's `bin` directory to `PATH` if `psql` is not recognized.

Use Git Bash for the shell commands in this guide. PowerShell may also be used,
but path and copy commands differ.

### Ubuntu or Debian

```bash
sudo apt update
sudo apt install postgresql postgresql-client
sudo systemctl enable --now postgresql
```

## 2. Clone and Enter the Repository

```bash
git clone https://github.com/auxomeness/CARES.git
cd CARES
```

## 3. Create the Local PostgreSQL Database

The standard local database configuration is:

```text
Database: cares
Role: cares
Password: cares
Host: localhost
Port: 5432
```

This password is for local development only.

### macOS or Linux

From the repository root:

```bash
chmod +x backend/scripts/setup-local-postgres.sh
./backend/scripts/setup-local-postgres.sh
```

If PostgreSQL requires an administrator name:

```bash
PGUSER=postgres ./backend/scripts/setup-local-postgres.sh
```

If your local administrator is your operating-system username:

```bash
PGUSER="$USER" ./backend/scripts/setup-local-postgres.sh
```

### Windows

Open SQL Shell (`psql`) or a terminal and connect as the `postgres`
administrator:

```bash
psql -U postgres -d postgres
```

Run:

```sql
CREATE ROLE cares WITH LOGIN PASSWORD 'cares';
CREATE DATABASE cares OWNER cares;
```

If the role or database already exists, skip the corresponding statement.
Exit with:

```text
\q
```

Verify the database:

```bash
psql "postgresql://cares:cares@localhost:5432/cares" -c "SELECT current_database(), current_user;"
```

## 4. Configure the Backend

```bash
cd backend
cp .env.example .env
```

The default `.env.example` already points to the local database:

```env
DATABASE_URL=postgresql://cares:cares@localhost:5432/cares
```

Replace `JWT_SECRET` with a random value containing at least 32 characters.

For local development without Docker or Redis, keep:

```env
REDIS_URL=
NOTIFICATION_QUEUE_ENABLED=false
NOTIFICATION_QUEUE_REQUIRED=false
```

Image uploads are optional. Leave these blank unless a Supabase Storage bucket
has been configured:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_BUCKET=
```

## 5. Install and Prepare the Backend

Still inside `backend/`:

```bash
npm install
npm run prisma:generate
npx prisma migrate deploy
npm run prisma:seed
npm run prisma:check
```

Use `npx prisma migrate deploy` when setting up an existing repository. Use
`npm run prisma:migrate` only when creating a new migration during development.

## 6. Start the Backend

Terminal 1:

```bash
cd CARES/backend
npm run dev
```

Verify:

```bash
curl http://localhost:3000/health
```

The API base URL is:

```text
http://localhost:3000/api/v1
```

## 7. Configure and Start the Frontend

Terminal 2:

```bash
cd CARES/frontend
cp .env.example .env
npm install
npm run dev
```

Open the URL printed by Vite, normally:

```text
http://localhost:5173
```

The backend's `CORS_ORIGIN` must match the frontend URL. If Vite starts on
another port, update `backend/.env`, for example:

```env
CORS_ORIGIN=http://localhost:5174
```

Restart the backend after changing its environment file.

## 8. Seed Accounts

All seeded accounts use:

```text
password123
```

Common accounts:

```text
Admin:        admin@adnu.edu.ph
Student:      student.maria@adnu.edu.ph
Office staff: office.staff@adnu.edu.ph
Dean:         cs.dean@adnu.edu.ph
Chair:        cs.chair@adnu.edu.ph
Professor:    cs.professor.one@adnu.edu.ph
```

Seed passwords are development-only and must not be used in production.

## 9. Verification Before Development

Backend:

```bash
cd backend
npm run lint
npm run build
npm test
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

## Daily Startup Sequence

After the first setup:

1. Start PostgreSQL.
2. Start the backend with `npm run dev` from `backend/`.
3. Start the frontend with `npm run dev` from `frontend/`.
4. Open the Vite URL.

No migration or seed command is required every day.

## Optional Docker Setup

Docker is not required. It exists to provide a reproducible PostgreSQL, Redis,
API, and notification-worker environment for CI, deployment testing, or
developers who do not want to install services directly.

To use only Docker's PostgreSQL and Redis while running Node.js locally:

```bash
docker compose up -d postgres redis
```

To run the complete container stack:

```bash
docker compose up --build
```

Do not run Docker PostgreSQL and native PostgreSQL on port `5432` at the same
time.

## Troubleshooting

### PostgreSQL is not accepting connections

macOS:

```bash
brew services restart postgresql@16
pg_isready -h localhost -p 5432
```

Windows:

Open Services and start the service named similar to
`postgresql-x64-16`.

### Port 5432 is already in use

Another PostgreSQL instance or Docker container is running. Stop one of them,
or configure a different port in both PostgreSQL and `DATABASE_URL`.

### Prisma cannot connect

Confirm:

```bash
psql "postgresql://cares:cares@localhost:5432/cares" -c "SELECT 1;"
```

Then verify that `backend/.env` contains the same connection string.

### The browser reports a CORS error

Set `CORS_ORIGIN` in `backend/.env` to the exact frontend origin, including its
port, then restart the backend.
