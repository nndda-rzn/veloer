# 09 — Implementation Phases

Roadmap implementasi bertahap: **Phase 1 (MVP)** berisi 11 fase untuk modul inti (Activity, Inventory, Maintenance, Finance, Dashboard), dan **Phase 2** berisi 3 fase untuk modul tambahan (Goals, Events, Dashboard v2).

---

## Overview

```
Phase 1 — MVP (v1.0.0)
├── F0:  GitFlow & Automation Setup
├── F1:  Project Setup (client + server)
├── F2:  Database Schema MVP
├── F3:  Auth: Strava OAuth + JWT
├── F4:  Activity Tracking (Strava sync, list, detail, map)
├── F5:  Inventory Module (bikes, components, lifespan)
├── F6:  Strava ↔ Inventory Integration (auto-update km)
├── F7:  Maintenance Module (log, schedules, alerts)
├── F8:  Finance Module (transactions, budgets, charts)
├── F9:  Dashboard ERP MVP
└── F10: Polish + README + Release v1.0.0

Phase 2 — Additional Modules (v2.0.0)
├── F11: Goals & Training Module
├── F12: Events Module
├── F13: Dashboard ERP v2 (expand with goals, events)
└── F14: Polish + Release v2.0.0
```

---

## Phase 1 — MVP

### Fase 0: GitFlow & Automation Setup

**Goal**: Git repo terstruktur dengan GitFlow, automation hooks, dan CI/CD siap.

**Branch**: `feature/gitflow-setup` → `develop`

**Tasks**:

- [ ] Init git repo di `tracking-sepeda/`
- [ ] Buat initial commit (README, .gitignore, docs)
- [ ] Push ke GitHub
- [ ] Buat branch `develop` dari `main`
- [ ] Setup root `package.json` (workspaces, scripts, tooling deps)
- [ ] Install: `husky`, `lint-staged`, `@commitlint/cli`, `@commitlint/config-conventional`, `standard-version`
- [ ] Init Husky: `npx husky init`
- [ ] Buat hooks: `pre-commit`, `commit-msg`, `pre-push`
- [ ] Setup ESLint config (shared)
- [ ] Setup Prettier config (shared)
- [ ] Buat `.gitignore` (node_modules, dist, .env, dll)
- [ ] Buat `.env.example` (root, client, server)
- [ ] Setup GitHub Actions workflow `ci.yml`
- [ ] PR → `develop`, merge
- [ ] Commit conventional: `chore(config): setup gitflow and automation`

---

### Fase 1: Project Setup

**Goal**: Struktur monorepo dengan client (React 19 + Vite + Tailwind v4) dan server (Express + Clean Architecture skeleton) siap untuk development.

**Branch**: `feature/project-setup` → `develop`

**Tasks Client**:

- [ ] Init Vite project: `npm create vite@latest client -- --template react-ts`
- [ ] Install & upgrade deps ke versi terkunci (React 19, Vite 8, TS 7)
- [ ] Install Tailwind v4: `npm install tailwindcss @tailwindcss/vite`
- [ ] Config `vite.config.ts` dengan `@vitejs/plugin-react` + `@tailwindcss/vite`
- [ ] Buat `src/index.css` dengan `@import "tailwindcss"` + `@theme`
- [ ] Setup path aliases (`@/` → `src/`) di `tsconfig.json` & `vite.config.ts`
- [ ] Install deps: `react-router-dom`, `@tanstack/react-query`, `axios`, `recharts`, `react-leaflet`, `leaflet`, `@mapbox/polyline`, `date-fns`
- [ ] Buat struktur folder dasar: `app/`, `features/`, `shared/`, `pages/`
- [ ] Setup React Router di `app/router.tsx`
- [ ] Setup React Query provider di `app/providers.tsx`
- [ ] Setup Axios client di `shared/lib/api-client.ts` (withCredentials)
- [ ] Buat layout dasar: `shared/components/layout/` (Sidebar, Header, Layout)

**Tasks Server**:

- [ ] Init server: `mkdir server && cd server && npm init -y`
- [ ] Install deps: `express`, `typescript`, `tsx`, `tsyringe`, `reflect-metadata`, `@supabase/supabase-js`, `jsonwebtoken`, `cookie-parser`, `cors`, `dotenv`
- [ ] Install dev deps: `@types/express`, `@types/node`, `@types/jsonwebtoken`, `@types/cookie-parser`, `@types/cors`, `eslint`, `prettier`
- [ ] Setup `tsconfig.json` (strict, ESNext, moduleResolution bundler)
- [ ] Buat struktur folder Clean Architecture: `domain/`, `application/`, `infrastructure/`, `interfaces/`, `config/`
- [ ] Buat `config/env.ts` (validasi env vars)
- [ ] Buat `infrastructure/http/server.ts` (Express app basic)
- [ ] Buat `index.ts` (entry point, start server)
- [ ] Setup CORS middleware
- [ ] Setup error handling middleware
- [ ] Test: run `npm run dev`, server respond di `http://localhost:3001`

**Commit examples**:

```
chore(client): init vite project with react 19 and tailwind v4
chore(server): init express project with typescript
feat(client): setup router, query provider, and api client
feat(server): setup express app with clean architecture skeleton
```

---

### Fase 2: Database Schema MVP

**Goal**: Semua tabel MVP terbuat di Supabase dengan RLS & triggers.

**Branch**: `feature/db-schema-mvp` → `develop`

**Tasks**:

- [ ] Buat `supabase/migrations/001_create_users_and_profiles.sql`
- [ ] Buat `supabase/migrations/002_create_bikes_and_components.sql`
- [ ] Buat `supabase/migrations/003_create_activities.sql`
- [ ] Buat `supabase/migrations/004_create_maintenance_tables.sql`
- [ ] Buat `supabase/migrations/005_create_finance_tables.sql`
- [ ] Buat `supabase/migrations/006_create_goals.sql` (siapkan untuk Phase 2)
- [ ] Buat `supabase/migrations/007_create_events.sql` (siapkan untuk Phase 2)
- [ ] Buat `supabase/migrations/008_add_foreign_keys.sql`
- [ ] Buat `supabase/migrations/009_enable_rls_and_policies.sql`
- [ ] Buat `supabase/migrations/010_create_triggers.sql`
- [ ] Jalankan semua migration di Supabase SQL Editor
- [ ] Verifikasi tabel di Table Editor

**Backend tasks**:

- [ ] Buat `server/src/infrastructure/database/supabase-client.ts`
- [ ] Buat domain entities untuk semua tabel MVP
- [ ] Buat repository interfaces di `domain/repositories/`
- [ ] Buat Supabase repository implementations di `infrastructure/database/repositories/`

**Commit examples**:

```
feat(db): add users and profiles tables migration
feat(db): add bikes and components tables
feat(server/domain): add entities for auth, activity, inventory
feat(server/infra): implement supabase repositories
```

---

### Fase 3: Auth — Strava OAuth + JWT

**Goal**: User bisa login via Strava, dapat JWT cookie, backend bisa refresh token.

**Branch**: `feature/strava-oauth-auth` → `develop`

**Tasks Backend**:

- [ ] Buat `domain/entities/auth/User.ts`, `StravaToken.ts`
- [ ] Buat `domain/repositories/auth/UserRepository.ts` (interface)
- [ ] Buat `application/ports/StravaPort.ts` (interface: getAccessToken, refreshToken, getAthlete)
- [ ] Buat `application/ports/TokenPort.ts` (interface: generateJWT, verifyJWT)
- [ ] Buat `infrastructure/strava/StravaOauthAdapter.ts` (implement StravaPort untuk OAuth)
- [ ] Buat `infrastructure/strava/StravaApiAdapter.ts` (implement StravaPort untuk API)
- [ ] Buat `infrastructure/auth/JwtTokenAdapter.ts` (implement TokenPort)
- [ ] Buat `infrastructure/database/repositories/auth/SupabaseUserRepository.ts`
- [ ] Buat use cases: `HandleStravaCallback`, `RefreshStravaToken`, `LogoutUser`
- [ ] Setup DI container di `config/dependencies.ts`
- [ ] Buat `interfaces/routes/auth.routes.ts` (`/login`, `/callback`, `/logout`, `/me`)
- [ ] Buat `interfaces/controllers/AuthController.ts`
- [ ] Buat `interfaces/middleware/auth.middleware.ts` (verify JWT, inject user)

**Tasks Frontend**:

- [ ] Buat `features/auth/api/auth.api.ts` (login, logout, getMe)
- [ ] Buat `features/auth/context/AuthContext.tsx`
- [ ] Buat `features/auth/hooks/useAuth.ts`
- [ ] Buat `features/auth/components/LoginPage.tsx`
- [ ] Buat `features/auth/components/ProtectedRoute.tsx`
- [ ] Setup route protection di `app/router.tsx`

**Commit examples**:

```
feat(server/domain): add User and StravaToken entities
feat(server/application): add StravaPort and TokenPort interfaces
feat(server/infra): implement StravaOauthAdapter
feat(server/infra): implement JwtTokenAdapter
feat(server/application): add HandleStravaCallback use case
feat(server/interfaces): add auth routes and controller
feat(client/features/auth): add AuthContext and useAuth hook
feat(client/features/auth): add LoginPage and ProtectedRoute
```

---

### Fase 4: Activity Tracking

**Goal**: Sync aktivitas dari Strava, tampilkan list, detail dengan peta, statistik.

**Branch**: `feature/activity-tracking` → `develop`

**Tasks Backend**:

- [ ] Buat `domain/entities/activity/Activity.ts`
- [ ] Buat `domain/repositories/activity/ActivityRepository.ts`
- [ ] Buat `infrastructure/database/repositories/activity/SupabaseActivityRepository.ts`
- [ ] Buat use cases: `SyncStravaActivities`, `GetActivities`, `GetActivityById`, `GetActivityStats`
- [ ] Extend `StravaApiAdapter` dengan `getActivities()`, `getActivityById()`
- [ ] Buat `interfaces/routes/activities.routes.ts`
- [ ] Buat `interfaces/controllers/ActivityController.ts`
- [ ] Register di DI container

**Tasks Frontend**:

- [ ] Buat `features/activities/api/activities.api.ts`
- [ ] Buat `features/activities/types.ts`
- [ ] Buat `features/activities/hooks/useActivities.ts`, `useActivityDetail.ts`
- [ ] Buat `features/activities/components/ActivityList.tsx`
- [ ] Buat `features/activities/components/ActivityListItem.tsx`
- [ ] Buat `features/activities/components/ActivityFilters.tsx` (date, bike, search)
- [ ] Buat `features/activities/components/ActivityDetail.tsx`
- [ ] Buat `features/map/utils/polyline.ts` (decode)
- [ ] Buat `features/map/hooks/usePolylineDecode.ts`
- [ ] Buat `features/map/components/ActivityMap.tsx` (react-leaflet)
- [ ] Buat `features/map/components/RoutePolyline.tsx`
- [ ] Buat `features/map/components/MapController.tsx` (auto-fit bounds)
- [ ] Buat `pages/ActivitiesPage.tsx`, `pages/ActivityDetailPage.tsx`

**Commit examples**:

```
feat(server/domain): add Activity entity and repository interface
feat(server/application): add SyncStravaActivities use case
feat(server/interfaces): add activities routes
feat(client/features/map): add ActivityMap with Leaflet
feat(client/features/activities): add ActivityList and filters
feat(client/features/activities): add ActivityDetail with map
```

---

### Fase 5: Inventory Module

**Goal**: CRUD sepeda & komponen dengan lifespan tracking.

**Branch**: `feature/inventory-module` → `develop`

**Tasks Backend**:

- [ ] Buat `domain/entities/inventory/Bike.ts`, `Component.ts`
- [ ] Buat `domain/repositories/inventory/BikeRepository.ts`, `ComponentRepository.ts`
- [ ] Buat Supabase implementations
- [ ] Buat use cases: `AddBike`, `UpdateBike`, `DeleteBike`, `GetBikes`, `GetBikeById`, `AddComponent`, `UpdateComponent`, `DeleteComponent`, `GetComponentLifespan`
- [ ] Buat `interfaces/routes/bikes.routes.ts`, `components.routes.ts`
- [ ] Buat `interfaces/controllers/BikeController.ts`, `ComponentController.ts`

**Tasks Frontend**:

- [ ] Buat `features/inventory/api/bikes.api.ts`, `components.api.ts`
- [ ] Buat `features/inventory/types.ts`
- [ ] Buat `features/inventory/hooks/useBikes.ts`, `useComponents.ts`
- [ ] Buat `features/inventory/components/BikeList.tsx`, `BikeCard.tsx`, `BikeForm.tsx`, `BikeDetail.tsx`
- [ ] Buat `features/inventory/components/ComponentList.tsx`, `ComponentForm.tsx`
- [ ] Buat `features/inventory/components/LifespanIndicator.tsx` (warna hijau/kuning/merah)
- [ ] Buat `pages/InventoryPage.tsx`

---

### Fase 6: Strava ↔ Inventory Integration

**Goal**: Saat sync aktivitas, otomatis update km sepeda & komponen.

**Branch**: `feature/strava-inventory-sync` → `develop`

**Tasks**:

- [ ] Modifikasi `SyncStravaActivities` use case: setelah insert aktivitas, update `bikes.current_km` & `components.current_km`
- [ ] Atau andalkan database trigger `update_bike_km_after_activity` (lihat [Database Schema](./04-database-schema.md))
- [ ] Tambah opsi di frontend: link aktivitas ke sepeda (dropdown di ActivityDetail)
- [ ] Buat endpoint: `PUT /api/activities/:id` untuk update `bike_id`
- [ ] Test: sync aktivitas → cek km sepeda & komponen terupdate
- [ ] Test: lifespan indicator berubah setelah sync

---

### Fase 7: Maintenance Module

**Goal**: Log maintenance, schedule reminder, due alerts.

**Branch**: `feature/maintenance-module` → `develop`

**Tasks Backend**:

- [ ] Buat domain entities: `MaintenanceLog`, `MaintenanceSchedule`
- [ ] Buat repository interfaces + Supabase implementations
- [ ] Buat use cases: `LogMaintenance`, `GetMaintenanceHistory`, `AddSchedule`, `UpdateSchedule`, `DeleteSchedule`, `CheckDueSchedules`
- [ ] Buat routes: `/api/maintenance/logs`, `/api/maintenance/schedules`, `/api/maintenance/due`
- [ ] Buat controller: `MaintenanceController`
- [ ] Integrasi: saat `LogMaintenance` dengan cost > 0 → auto-create transaction

**Tasks Frontend**:

- [ ] Buat `features/maintenance/api/maintenance.api.ts`
- [ ] Buat `features/maintenance/types.ts`
- [ ] Buat hooks: `useMaintenanceLogs`, `useMaintenanceSchedules`, `useDueAlerts`
- [ ] Buat `features/maintenance/components/MaintenanceLogList.tsx`
- [ ] Buat `features/maintenance/components/MaintenanceForm.tsx`
- [ ] Buat `features/maintenance/components/MaintenanceCalendar.tsx`
- [ ] Buat `features/maintenance/components/DueAlerts.tsx`
- [ ] Buat `features/maintenance/components/WearTracker.tsx`
- [ ] Buat `pages/MaintenancePage.tsx`

---

### Fase 8: Finance Module

**Goal**: Tracking transactions & budget dengan charts (IDR).

**Branch**: `feature/finance-module` → `develop`

**Tasks Backend**:

- [ ] Buat domain entities: `Transaction`, `Budget`
- [ ] Buat repository interfaces + Supabase implementations
- [ ] Buat use cases: `AddTransaction`, `UpdateTransaction`, `DeleteTransaction`, `GetTransactions`, `GetBudgetStatus`, `GetFinanceSummary`
- [ ] Buat routes: `/api/transactions`, `/api/budgets`, `/api/finance/summary`, `/api/finance/budget-status`
- [ ] Buat controller: `FinanceController`

**Tasks Frontend**:

- [ ] Buat `features/finance/api/transactions.api.ts`, `budgets.api.ts`
- [ ] Buat `features/finance/types.ts`
- [ ] Buat hooks: `useTransactions`, `useBudgets`, `useFinanceSummary`
- [ ] Buat `features/finance/components/TransactionList.tsx`
- [ ] Buat `features/finance/components/TransactionForm.tsx`
- [ ] Buat `features/finance/components/BudgetCard.tsx`, `BudgetProgress.tsx`
- [ ] Buat `features/finance/components/CategoryChart.tsx` (Recharts pie)
- [ ] Buat `features/finance/components/MonthlyChart.tsx` (Recharts bar)
- [ ] Buat `shared/lib/utils.ts`: `formatIDR()` helper
- [ ] Buat `pages/FinancePage.tsx`

---

### Fase 9: Dashboard ERP MVP

**Goal**: Dashboard overview meng-aggregate data dari semua modul MVP.

**Branch**: `feature/dashboard-mvp` → `develop`

**Tasks Frontend**:

- [ ] Buat `features/dashboard/hooks/useDashboardData.ts` (parallel fetch multiple endpoints)
- [ ] Buat `features/dashboard/components/KpiCard.tsx`
- [ ] Buat `features/dashboard/components/MaintenanceAlerts.tsx`
- [ ] Buat `features/dashboard/components/BudgetSummary.tsx`
- [ ] Buat `features/dashboard/components/RecentActivities.tsx`
- [ ] Buat `features/dashboard/components/RecentTransactions.tsx`
- [ ] Buat `features/dashboard/components/WeeklyDistanceChart.tsx` (Recharts)
- [ ] Buat `features/dashboard/components/DashboardOverview.tsx` (compose all)
- [ ] Buat `pages/DashboardPage.tsx`
- [ ] Tambah "Sync Now" button yang trigger `/api/sync` + invalidate React Query cache

---

### Fase 10: Polish + Release v1.0.0

**Goal**: Finalisasi MVP, siap release.

**Branch**: `release/v1.0.0` → `main`

**Tasks**:

- [ ] Loading states (skeleton/spinner) di semua pages
- [ ] Error boundaries di `shared/components/feedback/ErrorBoundary.tsx`
- [ ] Empty states (ilustrasi + message) di semua list
- [ ] Toast notifications untuk success/error actions
- [ ] Responsive design: test di mobile (375px), tablet (768px), desktop (1280px+)
- [ ] Dark mode support (opsional, via Tailwind v4 `@theme`)
- [ ] Lengkapi README.md dengan setup guide
- [ ] Test full flow: login → sync → dashboard → browse activities → add bike → log maintenance → add transaction
- [ ] Fix bugs yang ditemukan
- [ ] Run `npm run release` (standard-version, generate CHANGELOG.md, bump version)
- [ ] Merge `release/v1.0.0` → `main` + tag `v1.0.0`
- [ ] Deploy ke production (Vercel + Railway)
- [ ] Verify production works end-to-end

---

## Phase 2 — Additional Modules

### Fase 11: Goals & Training Module

**Goal**: Goal CRUD dengan auto-progress dari aktivitas.

**Branch**: `feature/goals-module` → `develop`

**Tasks Backend**:

- [ ] Buat `domain/entities/goals/Goal.ts`
- [ ] Buat repository interface + Supabase implementation
- [ ] Buat use cases: `CreateGoal`, `UpdateGoal`, `DeleteGoal`, `GetGoals`, `GetGoalStatus`, `UpdateGoalProgress`
- [ ] Modifikasi `SyncStravaActivities`: panggil `UpdateGoalProgress` untuk setiap aktivitas baru
- [ ] Buat routes: `/api/goals`
- [ ] Buat controller: `GoalController`

**Tasks Frontend**:

- [ ] Buat `features/goals/api/goals.api.ts`, `types.ts`
- [ ] Buat hooks: `useGoals`, `useGoalStatus`
- [ ] Buat `features/goals/components/GoalList.tsx`, `GoalCard.tsx`, `GoalForm.tsx`
- [ ] Buat `features/goals/components/ProgressRing.tsx` (circular progress, SVG)
- [ ] Buat `features/goals/components/GoalAnalytics.tsx` (tren pencapaian)
- [ ] Buat `pages/GoalsPage.tsx`

---

### Fase 12: Events Module

**Goal**: Manajemen event sepeda dengan calendar view.

**Branch**: `feature/events-module` → `develop`

**Tasks Backend**:

- [ ] Buat `domain/entities/events/Event.ts`
- [ ] Buat repository interface + Supabase implementation
- [ ] Buat use cases: `AddEvent`, `UpdateEvent`, `DeleteEvent`, `GetEvents`, `GetUpcomingEvents`, `UpdateEventResult`
- [ ] Integrasi: saat event completed dengan registration_fee → auto-create transaction
- [ ] Buat routes: `/api/events`
- [ ] Buat controller: `EventController`

**Tasks Frontend**:

- [ ] Buat `features/events/api/events.api.ts`, `types.ts`
- [ ] Buat hooks: `useEvents`, `useUpcomingEvents`
- [ ] Buat `features/events/components/EventCalendar.tsx`
- [ ] Buat `features/events/components/EventList.tsx`, `EventForm.tsx`, `EventDetail.tsx`
- [ ] Buat `pages/EventsPage.tsx`

---

### Fase 13: Dashboard ERP v2

**Goal**: Expand dashboard dengan goals progress & event calendar.

**Branch**: `feature/dashboard-v2` → `develop`

**Tasks**:

- [ ] Tambah `features/dashboard/components/GoalProgress.tsx` (progress ring goal aktif)
- [ ] Tambah `features/dashboard/components/UpcomingEvents.tsx` (event 30 hari ke depan)
- [ ] Update `useDashboardData.ts` untuk fetch goals & events juga
- [ ] Update layout `DashboardOverview.tsx` untuk include komponen baru
- [ ] Responsive layout untuk komponen tambahan

---

### Fase 14: Polish + Release v2.0.0

**Goal**: Finalisasi Phase 2, siap release.

**Branch**: `release/v2.0.0` → `main`

**Tasks**:

- [ ] Test full flow: semua 7 modul terintegrasi
- [ ] Test auto-progress goals setelah sync Strava
- [ ] Test auto-create transaction saat log maintenance & event completed
- [ ] Polish UI consistency
- [ ] Update README & docs dengan fitur Phase 2
- [ ] Run `npm run release -- --release-as minor` (v1.1.0 atau major v2.0.0)
- [ ] Merge → `main` + tag
- [ ] Deploy production
- [ ] Verify production

---

## Branching Summary

| Fase | Branch                          | Merge Ke           |
| ---- | ------------------------------- | ------------------ |
| F0   | `feature/gitflow-setup`         | `develop`          |
| F1   | `feature/project-setup`         | `develop`          |
| F2   | `feature/db-schema-mvp`         | `develop`          |
| F3   | `feature/strava-oauth-auth`     | `develop`          |
| F4   | `feature/activity-tracking`     | `develop`          |
| F5   | `feature/inventory-module`      | `develop`          |
| F6   | `feature/strava-inventory-sync` | `develop`          |
| F7   | `feature/maintenance-module`    | `develop`          |
| F8   | `feature/finance-module`        | `develop`          |
| F9   | `feature/dashboard-mvp`         | `develop`          |
| F10  | `release/v1.0.0`                | `main` + `develop` |
| F11  | `feature/goals-module`          | `develop`          |
| F12  | `feature/events-module`         | `develop`          |
| F13  | `feature/dashboard-v2`          | `develop`          |
| F14  | `release/v2.0.0`                | `main` + `develop` |

---

## Catatan Eksekusi

1. **Setiap fase = satu PR**: Buat branch, kerjakan, push, PR ke `develop`, review, merge
2. **Commit berkala**: Jangan akumulasi terlalu banyak per commit. Satu unit kerja = satu commit
3. **Conventional Commits**: Wajib, karena commitlint akan reject jika tidak sesuai format
4. **Test setiap fase**: Pastikan tidak break fase sebelumnya sebelum merge
5. **Update docs jika ada perubahan**: Jika ada deviasi dari rencana, update docs terkait
