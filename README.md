# Veloer — Mini ERP Sepeda Pribadi

> **Your Personal Cycling ERP** — Track. Maintain. Ride.

Veloer adalah sistem ERP pribadi untuk mengelola seluruh siklus hidup hobi bersepeda: tracking aktivitas, inventaris gear, maintenance, keuangan, goals, dan events — dengan data terintegrasi antar modul.

---

## Ringkasan

Bukan sekadar aplikasi tracking aktivitas, melainkan sistem terintegrasi yang menghubungkan:

- **Aktivitas** bersepeda (sync dari Strava)
- **Inventaris** sepeda & komponen
- **Maintenance** log & jadwal
- **Keuangan** pengeluaran sepeda (IDR)
- **Goals** & progres training
- **Events** sepeda
- **Dashboard ERP** overview

Semua modul saling terhubung. Contoh: aktivitas 50km hari ini otomatis update jarak sepeda, update umur pakai rantai, trigger alert "waktunya ganti rantai", dan update progres goal bulanan.

---

## Dokumentasi

Dokumentasi lengkap ada di folder [`docs/`](./docs). Baca secara berurutan untuk memahami keseluruhan sistem:

| #   | Dokumen                                                     | Isi                                                                 |
| --- | ----------------------------------------------------------- | ------------------------------------------------------------------- |
| 01  | [Overview](./docs/01-overview.md)                           | Visi, konsep ERP, daftar modul, relasi antar modul                  |
| 02  | [Tech Stack](./docs/02-tech-stack.md)                       | Versi package terkunci, alasan pemilihan, kompatibilitas            |
| 03  | [Architecture](./docs/03-architecture.md)                   | Clean Architecture backend, feature-based frontend, struktur folder |
| 04  | [Database Schema](./docs/04-database-schema.md)             | 13 tabel, relasi, RLS, migration SQL                                |
| 05  | [Modules](./docs/05-modules.md)                             | Detail 7 modul ERP, fitur, integrasi antar modul                    |
| 06  | [GitFlow](./docs/06-gitflow.md)                             | Branch strategy, Conventional Commits, Husky, CI/CD                 |
| 07  | [Setup Guide](./docs/07-setup-guide.md)                     | Strava Developer, Supabase, install, run dev                        |
| 08  | [Deployment](./docs/08-deployment.md)                       | Vercel, Railway/Render, environment variables                       |
| 09  | [Implementation Phases](./docs/09-implementation-phases.md) | 14 fase implementasi bertahap, branching plan                       |

---

## Status Project

**v1.0.0 — Phase 1 MVP Complete**

| Modul       | Fitur                                                  | Status  |
| ----------- | ------------------------------------------------------ | ------- |
| Activity    | Strava sync, list + filters, detail + map, bike linker | ✅      |
| Inventory   | Bike CRUD, Component CRUD, Lifespan indicator          | ✅      |
| Maintenance | Log CRUD, Due alerts, Schedule management              | ✅      |
| Finance     | Transaction CRUD, Budget, Recharts pie chart, IDR      | ✅      |
| Dashboard   | KPI cards, Alerts, Recent activities, Charts           | ✅      |
| Goals       | Goal CRUD, Progress tracking                           | Phase 2 |
| Events      | Event CRUD, Calendar                                   | Phase 2 |

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm 10+
- Supabase account (free tier OK)
- Strava Developer app (free)

### 1. Clone & Install

```bash
git clone https://github.com/nndda-rzn/veloer.git
cd veloer

# Install all dependencies (root + client + server)
npm install
cd client && npm install
cd ../server && npm install
```

### 2. Setup Strava Developer App

1. Go to [https://www.strava.com/settings/api](https://www.strava.com/settings/api)
2. Create a new app:
   - **App Name**: Veloer (or anything you like)
   - **Category**: Personal
   - **Website**: `http://localhost:5173`
   - **Authorization Redirect Domain**: `localhost`
3. Note down your **Client ID** and **Client Secret**

### 3. Setup Supabase

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Create a new project (free tier)
3. Go to **SQL Editor** and run the migration files in order:
   ```
   supabase/migrations/001_create_users_and_profiles.sql
   supabase/migrations/002_create_bikes_and_components.sql
   ... (run all 001-011 in order)
   ```
4. Go to **Project Settings > API** and note down:
   - **Project URL** (e.g., `https://xxxx.supabase.co`)
   - **service_role key** (not the anon key)

### 4. Configure Environment Variables

```bash
# Server
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
PORT=3001
NODE_ENV=development

# Strava (from step 2)
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
STRAVA_REDIRECT_URI=http://localhost:3001/api/auth/callback

# Supabase (from step 3)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your_generated_secret
JWT_EXPIRES_IN=7d

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173
```

```bash
# Client
cp client/.env.example client/.env
```

Edit `client/.env`:

```env
VITE_API_URL=http://localhost:3001
```

### 5. Run Development

```bash
# Terminal 1 (server):
cd server && npm run dev

# Terminal 2 (client):
cd client && npm run dev
```

Server runs at `http://localhost:3001`, client at `http://localhost:5173`.

### 6. Login

1. Open `http://localhost:5173` in your browser
2. Click "Login with Strava"
3. Authorize the app on Strava
4. You'll be redirected back to the dashboard
5. Click "Sync Now" to fetch your cycling activities

---

## API Endpoints

| Method           | Endpoint                             | Description                                                          |
| ---------------- | ------------------------------------ | -------------------------------------------------------------------- |
| GET              | `/api/auth/login`                    | Redirect to Strava OAuth                                             |
| GET              | `/api/auth/callback`                 | Strava OAuth callback                                                |
| GET              | `/api/auth/me`                       | Get current user                                                     |
| POST             | `/api/auth/logout`                   | Logout                                                               |
| GET              | `/api/activities`                    | List activities (filters: limit, offset, bikeId, startDate, endDate) |
| GET              | `/api/activities/:id`                | Get activity detail                                                  |
| GET              | `/api/activities/stats`              | Get activity statistics                                              |
| PATCH            | `/api/activities/:id/bike`           | Link activity to bike                                                |
| POST             | `/api/sync`                          | Sync from Strava                                                     |
| GET/POST         | `/api/bikes`                         | List/create bikes                                                    |
| GET/PATCH/DELETE | `/api/bikes/:id`                     | Bike CRUD                                                            |
| GET/POST         | `/api/bikes/:bikeId/components`      | List/create components                                               |
| PATCH/DELETE     | `/api/components/:id`                | Component CRUD                                                       |
| GET/POST         | `/api/maintenance/:bikeId/logs`      | List/create maintenance logs                                         |
| DELETE           | `/api/maintenance/logs/:id`          | Delete maintenance log                                               |
| GET/POST         | `/api/maintenance/:bikeId/schedules` | List/create schedules                                                |
| GET              | `/api/maintenance/due`               | Get due schedules                                                    |
| GET/POST         | `/api/finance/transactions`          | List/create transactions                                             |
| PATCH/DELETE     | `/api/finance/transactions/:id`      | Transaction CRUD                                                     |
| GET              | `/api/finance/summary`               | Finance summary (income, expense, byCategory)                        |
| GET/POST         | `/api/finance/budgets`               | List/create budgets                                                  |
| PATCH/DELETE     | `/api/finance/budgets/:id`           | Budget CRUD                                                          |

---

## Tech Stack

- **Frontend**: React 19 + Vite 8 + TypeScript 7 + Tailwind v4 + Recharts + Leaflet
- **Backend**: Express 4 + TypeScript 7 + tsyringe (Clean Architecture) + Supabase
- **Integrasi**: Strava API v3
- **Auth**: JWT (httpOnly cookie) + Strava OAuth
- **Database**: Supabase (PostgreSQL) with RLS
- **Deployment**: Vercel (FE) + Railway/Render (BE)

Detail versi package ada di [Tech Stack](./docs/02-tech-stack.md).

---

## Development

```bash
# Lint all
npm run lint

# Type-check all
npm run type-check

# Build all
npm run build

# Create release (generates changelog, bumps version)
npm run release
```

### GitFlow

This project uses GitFlow with per-sub-feature PRs:

- `main` — production releases
- `develop` — integration branch
- `feature/*` — feature branches (squash & merge to develop)

Conventional Commits are enforced via commitlint + Husky.
