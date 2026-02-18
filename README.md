# Exacta Employee Management
Full-stack employee break, attendance, and leave tracker with role-based workflows, realtime updates, and admin reporting.

## Stack Overview
- Frontend: React + Vite + Tailwind
- Backend: Express + Prisma (SQLite)
- Auth: Supabase Auth (frontend login) + backend token verification
- Realtime: Socket.IO

Admin routes in frontend are guarded by role (`ADMIN`) and backend admin APIs also enforce `ADMIN` via middleware.

## Required Environment Variables

### Backend (`.env` at repo root or `server/.env`)
- `JWT_SECRET`
- `CORS_ORIGIN` (example: `http://localhost:5173`)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Frontend (`client/.env`)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Local Setup
1. Install dependencies:
```bash
npm run setup
```

2. Seed local Prisma admin user (required for backend admin guard):
```bash
SEED_ADMIN_PASSWORD='ChangeMeStrong123!' npm run seed
```
PowerShell:
```powershell
$env:SEED_ADMIN_PASSWORD='ChangeMeStrong123!'; npm run seed
```

3. Start app:
```bash
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Create and Map an Admin Account (Supabase + Prisma)
Use the same person/account across frontend auth and backend authorization.

1. Ensure local Prisma admin exists (`empId = ADMIN`, `role = ADMIN`) by running seed (above).

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
2. Login via frontend `/login` with the Supabase admin email/password.
3. Confirm admin UI appears:
   - Sidebar shows `Employees`, `Reports`, `Settings`.
   - `/admin/dashboard` loads.
4. Confirm backend admin endpoint works with the same Supabase token (script below).

### Scripted check
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
