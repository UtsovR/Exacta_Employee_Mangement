# Exacta Employee Management
Full-stack employee break, attendance, and leave tracker with role-based workflows, realtime updates, and admin reporting.

## Stack Overview
- Frontend: React + Vite + Tailwind
- Backend: Express + Prisma (PostgreSQL)
- Auth: Supabase Auth (frontend login) + backend token verification
- Realtime: Socket.IO

Admin routes in frontend are guarded by role (`ADMIN`) and backend admin APIs enforce `ADMIN` via middleware.

## Database
PostgreSQL is the only supported database for this project.

## Required Environment Variables

### Backend (`server/.env` preferred)
- `DATABASE_URL` (PostgreSQL runtime URL)
- `JWT_SECRET`
- `CORS_ORIGIN` (example: `http://localhost:5173`)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SEED_ADMIN_PASSWORD` (required for `npm run seed`)
- `SEED_ADMIN_EMAIL` (optional)

### Frontend (`client/.env`)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## PostgreSQL Local Setup

### Option A: Docker (recommended)
```powershell
docker run --name exacta-pg -e POSTGRES_USER=exacta -e POSTGRES_PASSWORD=exacta_pass -e POSTGRES_DB=exacta_bms -p 5432:5432 -d postgres:16
```

`DATABASE_URL` example:
```env
DATABASE_URL="postgresql://exacta:exacta_pass@localhost:5432/exacta_bms?schema=public"
```

### Option B: Supabase pooler/session connection
Use the exact DB connection string from Supabase Dashboard -> Settings -> Database.

## Local Setup
1. Install dependencies:
```bash
npm run setup
```

2. Generate Prisma client:
```bash
npm --prefix server run prisma:generate
```

3. Apply migrations:
```bash
npm --prefix server run prisma:deploy
```

4. Seed admin user (idempotent):
```bash
npm run seed
```

5. Start app:
```bash
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Create and Map an Admin Account (Supabase + Prisma)
Use the same person/account across frontend auth and backend authorization.

1. Ensure local Prisma admin exists (`empId = ADMIN`, `role = ADMIN`) by running seed.

2. In Supabase Dashboard -> Auth -> Users, create an email/password user for admin.

3. Set that Supabase user metadata to include admin role + empId mapping:
```json
{
  "role": "ADMIN",
  "empId": "ADMIN",
  "name": "System Admin"
}
```

4. In Supabase SQL Editor, upsert profile row (replace placeholders):
```sql
insert into profiles (id, email, role, emp_id, name)
values ('<SUPABASE_USER_ID>', '<ADMIN_EMAIL>', 'ADMIN', 'ADMIN', 'System Admin')
on conflict (id) do update set
  email = excluded.email,
  role = excluded.role,
  emp_id = excluded.emp_id,
  name = excluded.name;
```

This mapping ensures:
- Frontend role hydration reads `ADMIN` from profile/metadata.
- Backend maps Supabase token to local Prisma admin user (`email` and/or `empId`).

## Runtime Verification

### Manual checklist
1. Start app (`npm run dev`).
2. Login via frontend `/login` with Supabase admin email/password.
3. Confirm admin UI appears:
   - Sidebar shows admin items.
   - `/admin/dashboard` loads.
4. Confirm backend admin endpoint works with the same Supabase token.

### Scripted admin check
With backend running, execute:
```bash
VERIFY_ADMIN_EMAIL='<ADMIN_EMAIL>' VERIFY_ADMIN_PASSWORD='<ADMIN_PASSWORD>' npm --prefix server run verify:admin-flow
```
PowerShell:
```powershell
$env:VERIFY_ADMIN_EMAIL='<ADMIN_EMAIL>'
$env:VERIFY_ADMIN_PASSWORD='<ADMIN_PASSWORD>'
npm --prefix server run verify:admin-flow
```

The script validates:
- Supabase login succeeds.
- Profile role resolves to `ADMIN`.
- Backend admin API call (`/api/users`) succeeds with the same token.
