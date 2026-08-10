# 03 — Architecture

Project ini menggunakan **monorepo** dengan dua aplikasi terpisah: `client/` (React SPA) dan `server/` (Express API). Backend menerapkan **Clean Architecture**, frontend menerapkan **feature-based granular** structure.

---

## Struktur Monorepo

```
tracking-sepeda/
├── client/                         # Frontend React 19 + Vite
├── server/                         # Backend Express + Clean Architecture
├── supabase/
│   └── migrations/                 # SQL migration files
├── docs/                           # Dokumentasi (file-file ini)
├── .github/
│   └── workflows/                  # GitHub Actions CI/CD
├── .husky/                         # Git hooks
├── .env.example                    # Template env vars
├── package.json                    # Root: tooling (husky, commitlint, dll)
└── README.md
```

---

## Backend: Clean Architecture

Backend Express 4 menerapkan Clean Architecture dengan 4 lapisan. Aturan dependency: **lapisan dalam tidak boleh mengenal lapisan luar**.

```
domain ← application ← infrastructure ← interfaces
  (inti)    (use cases)   (implementasi)    (HTTP)
```

### Lapisan & Aturan Dependency

```
┌─────────────────────────────────────────────────┐
│ interfaces/         (routes, controllers, mw)   │  ← mengenal semua
├─────────────────────────────────────────────────┤
│ infrastructure/     (supabase, strava, jwt)     │  ← mengenal application + domain
├─────────────────────────────────────────────────┤
│ application/        (use cases, ports)          │  ← hanya mengenal domain
├─────────────────────────────────────────────────┤
│ domain/             (entities, repo interfaces) │  ← tidak mengenal apa pun (pure TS)
└─────────────────────────────────────────────────┘
```

### Struktur Folder Backend

```
server/src/
├── domain/                                # Lapisan inti bisnis (pure TypeScript)
│   ├── entities/
│   │   ├── auth/
│   │   │   ├── User.ts
│   │   │   └── StravaToken.ts
│   │   ├── activity/
│   │   │   └── Activity.ts
│   │   ├── inventory/
│   │   │   ├── Bike.ts
│   │   │   └── Component.ts
│   │   ├── maintenance/
│   │   │   ├── MaintenanceLog.ts
│   │   │   └── MaintenanceSchedule.ts
│   │   ├── finance/
│   │   │   ├── Transaction.ts
│   │   │   └── Budget.ts
│   │   ├── goals/
│   │   │   └── Goal.ts
│   │   └── events/
│   │       └── Event.ts
│   └── repositories/                      # Interface (kontrak) repository
│       ├── auth/
│       │   ├── UserRepository.ts
│       │   └── UserProfileRepository.ts
│       ├── activity/
│       │   └── ActivityRepository.ts
│       ├── inventory/
│       │   ├── BikeRepository.ts
│       │   └── ComponentRepository.ts
│       ├── maintenance/
│       │   ├── MaintenanceLogRepository.ts
│       │   └── MaintenanceScheduleRepository.ts
│       ├── finance/
│       │   ├── TransactionRepository.ts
│       │   └── BudgetRepository.ts
│       ├── goals/
│       │   └── GoalRepository.ts
│       └── events/
│           └── EventRepository.ts
│
├── application/                           # Logika aplikasi (use cases)
│   ├── use-cases/
│   │   ├── auth/
│   │   │   ├── HandleStravaCallback.ts
│   │   │   ├── RefreshStravaToken.ts
│   │   │   └── LogoutUser.ts
│   │   ├── activity/
│   │   │   ├── SyncStravaActivities.ts
│   │   │   ├── GetActivities.ts
│   │   │   ├── GetActivityById.ts
│   │   │   └── GetActivityStats.ts
│   │   ├── inventory/
│   │   │   ├── AddBike.ts
│   │   │   ├── UpdateBike.ts
│   │   │   ├── AddComponent.ts
│   │   │   ├── UpdateComponentKm.ts        # Dipanggil saat sync aktivitas
│   │   │   └── GetComponentLifespan.ts
│   │   ├── maintenance/
│   │   │   ├── LogMaintenance.ts
│   │   │   ├── CheckDueSchedules.ts        # Cek maintenance yang due
│   │   │   └── GetMaintenanceHistory.ts
│   │   ├── finance/
│   │   │   ├── AddTransaction.ts
│   │   │   ├── GetBudgetStatus.ts
│   │   │   └── GetFinanceSummary.ts
│   │   ├── goals/
│   │   │   ├── CreateGoal.ts
│   │   │   ├── UpdateGoalProgress.ts       # Dipanggil saat sync aktivitas
│   │   │   └── GetGoalStatus.ts
│   │   └── events/
│   │       ├── AddEvent.ts
│   │       └── UpdateEventResult.ts
│   └── ports/                             # Interface untuk service eksternal
│       ├── StravaPort.ts                  # Kontrak Strava API
│       ├── TokenPort.ts                   # Kontrak JWT management
│       └── LoggerPort.ts
│
├── infrastructure/                        # Implementasi konkret
│   ├── database/
│   │   ├── supabase-client.ts
│   │   └── repositories/                  # Implementasi repo interface di domain/
│   │       ├── auth/
│   │       │   ├── SupabaseUserRepository.ts
│   │       │   └── SupabaseUserProfileRepository.ts
│   │       ├── activity/
│   │       │   └── SupabaseActivityRepository.ts
│   │       ├── inventory/
│   │       │   ├── SupabaseBikeRepository.ts
│   │       │   └── SupabaseComponentRepository.ts
│   │       ├── maintenance/
│   │       │   ├── SupabaseMaintenanceLogRepository.ts
│   │       │   └── SupabaseMaintenanceScheduleRepository.ts
│   │       ├── finance/
│   │       │   ├── SupabaseTransactionRepository.ts
│   │       │   └── SupabaseBudgetRepository.ts
│   │       ├── goals/
│   │       │   └── SupabaseGoalRepository.ts
│   │       └── events/
│   │           └── SupabaseEventRepository.ts
│   ├── strava/
│   │   ├── StravaApiAdapter.ts            # Implementasi StravaPort
│   │   └── StravaOauthAdapter.ts
│   ├── auth/
│   │   └── JwtTokenAdapter.ts             # Implementasi TokenPort
│   └── http/
│       └── server.ts                      # Konfigurasi Express app
│
├── interfaces/                            # Lapisan presentasi HTTP
│   ├── routes/
│   │   ├── auth.routes.ts                 # /api/auth/*
│   │   ├── activities.routes.ts           # /api/activities/*
│   │   ├── bikes.routes.ts                # /api/bikes/*
│   │   ├── components.routes.ts           # /api/components/*
│   │   ├── maintenance.routes.ts          # /api/maintenance/*
│   │   ├── transactions.routes.ts         # /api/transactions/*
│   │   ├── budgets.routes.ts              # /api/budgets/*
│   │   ├── goals.routes.ts                # /api/goals/*
│   │   └── events.routes.ts               # /api/events/*
│   ├── controllers/
│   │   ├── AuthController.ts
│   │   ├── ActivityController.ts
│   │   ├── BikeController.ts
│   │   ├── ComponentController.ts
│   │   ├── MaintenanceController.ts
│   │   ├── FinanceController.ts
│   │   ├── GoalController.ts
│   │   └── EventController.ts
│   └── middleware/
│       ├── auth.middleware.ts             # Verify JWT
│       ├── error.middleware.ts            # Global error handler
│       └── cors.middleware.ts
│
├── config/
│   ├── env.ts                             # Validasi environment variables
│   └── dependencies.ts                    # DI container (tsyringe)
│
└── index.ts                               # Entry point
```

### Dependency Injection (tsyringe)

Wiring dependencies dilakukan di `config/dependencies.ts`:

```ts
import { container } from 'tsyringe'
import { SupabaseUserRepository } from '../infrastructure/database/repositories/auth/SupabaseUserRepository'
import { UserRepository } from '../domain/repositories/auth/UserRepository'
// ... imports lain

container.registerSingleton<UserRepository>(
  'UserRepository',
  SupabaseUserRepository
)
// ... registrasi lainnya
```

Use cases menerima dependency via constructor injection:

```ts
@injectable()
export class HandleStravaCallback {
  constructor(
    @inject('UserRepository') private userRepo: UserRepository,
    @inject('StravaPort') private stravaPort: StravaPort,
    @inject('TokenPort') private tokenPort: TokenPort,
  ) {}
  
  async execute(code: string) { ... }
}
```

---

## Frontend: Feature-Based Granular

Frontend menggunakan **feature-based** structure — setiap modul ERP menjadi feature independen dengan komponen, hooks, api, dan types sendiri.

### Struktur Folder Frontend

```
client/src/
├── app/                                   # App-level setup
│   ├── App.tsx                            # Root component
│   ├── router.tsx                         # React Router config
│   └── providers.tsx                      # Composition of context providers
│
├── features/                              # Feature modules (per modul ERP)
│   ├── auth/
│   │   ├── api/
│   │   │   └── auth.api.ts
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── types.ts
│   │   └── index.ts                       # Barrel export (public API)
│   │
│   ├── dashboard/                         # Modul 7: ERP Dashboard
│   │   ├── components/
│   │   │   ├── DashboardOverview.tsx
│   │   │   ├── KpiCard.tsx
│   │   │   ├── MaintenanceAlerts.tsx
│   │   │   ├── BudgetSummary.tsx
│   │   │   ├── RecentActivities.tsx
│   │   │   ├── GoalProgress.tsx
│   │   │   └── UpcomingEvents.tsx
│   │   ├── hooks/
│   │   │   └── useDashboardData.ts
│   │   └── index.ts
│   │
│   ├── activities/                        # Modul 1: Activity Tracking
│   │   ├── components/
│   │   │   ├── ActivityList.tsx
│   │   │   ├── ActivityListItem.tsx
│   │   │   ├── ActivityFilters.tsx
│   │   │   ├── ActivityDetail.tsx
│   │   │   └── ActivityStats.tsx
│   │   ├── hooks/
│   │   │   ├── useActivities.ts
│   │   │   └── useActivityDetail.ts
│   │   ├── api/
│   │   │   └── activities.api.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── inventory/                         # Modul 2: Bike & Gear
│   │   ├── components/
│   │   │   ├── BikeList.tsx
│   │   │   ├── BikeCard.tsx
│   │   │   ├── BikeForm.tsx
│   │   │   ├── BikeDetail.tsx
│   │   │   ├── ComponentList.tsx
│   │   │   ├── ComponentForm.tsx
│   │   │   └── LifespanIndicator.tsx
│   │   ├── hooks/
│   │   │   ├── useBikes.ts
│   │   │   └── useComponents.ts
│   │   ├── api/
│   │   │   ├── bikes.api.ts
│   │   │   └── components.api.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── maintenance/                       # Modul 3: Maintenance Log
│   │   ├── components/
│   │   │   ├── MaintenanceCalendar.tsx
│   │   │   ├── MaintenanceLogList.tsx
│   │   │   ├── MaintenanceForm.tsx
│   │   │   ├── DueAlerts.tsx
│   │   │   └── WearTracker.tsx
│   │   ├── hooks/
│   │   │   └── useMaintenance.ts
│   │   ├── api/
│   │   │   └── maintenance.api.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── finance/                           # Modul 4: Finance Tracker
│   │   ├── components/
│   │   │   ├── TransactionList.tsx
│   │   │   ├── TransactionForm.tsx
│   │   │   ├── BudgetCard.tsx
│   │   │   ├── BudgetProgress.tsx
│   │   │   ├── FinanceSummary.tsx
│   │   │   └── CategoryChart.tsx
│   │   ├── hooks/
│   │   │   ├── useTransactions.ts
│   │   │   └── useBudgets.ts
│   │   ├── api/
│   │   │   ├── transactions.api.ts
│   │   │   └── budgets.api.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── goals/                             # Modul 5: Goals & Training
│   │   ├── components/
│   │   │   ├── GoalList.tsx
│   │   │   ├── GoalCard.tsx
│   │   │   ├── GoalForm.tsx
│   │   │   └── ProgressRing.tsx
│   │   ├── hooks/
│   │   │   └── useGoals.ts
│   │   ├── api/
│   │   │   └── goals.api.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── events/                            # Modul 6: Events
│   │   ├── components/
│   │   │   ├── EventCalendar.tsx
│   │   │   ├── EventList.tsx
│   │   │   ├── EventForm.tsx
│   │   │   └── EventDetail.tsx
│   │   ├── hooks/
│   │   │   └── useEvents.ts
│   │   ├── api/
│   │   │   └── events.api.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   └── map/                               # Shared map feature
│       ├── components/
│       │   ├── ActivityMap.tsx
│       │   ├── RoutePolyline.tsx
│       │   └── MapController.tsx
│       ├── hooks/
│       │   └── usePolylineDecode.ts
│       └── utils/
│           └── polyline.ts
│
├── shared/                                # Shared lintas features
│   ├── components/
│   │   ├── ui/                            # Button, Card, Input, Badge, dll
│   │   ├── layout/                        # Sidebar, Header, Layout, PageContainer
│   │   └── feedback/                      # Loading, ErrorBoundary, EmptyState, Toast
│   ├── lib/
│   │   ├── api-client.ts                  # Axios instance + interceptors
│   │   └── utils.ts                       # formatDistance, formatDuration, formatIDR, dll
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   └── useLocalStorage.ts
│   └── types/
│       └── common.ts                      # ApiResponse, Pagination, dll
│
├── pages/                                 # Route-level pages
│   ├── DashboardPage.tsx
│   ├── ActivitiesPage.tsx
│   ├── ActivityDetailPage.tsx
│   ├── InventoryPage.tsx                  # Bikes & Components
│   ├── MaintenancePage.tsx
│   ├── FinancePage.tsx
│   ├── GoalsPage.tsx
│   ├── EventsPage.tsx
│   ├── SettingsPage.tsx
│   └── LoginPage.tsx
│
├── main.tsx                               # Entry point
└── index.css                              # Tailwind import + @theme
```

### Aturan Feature-Based

1. **Barrel export**: Setiap feature punya `index.ts` sebagai public API. File luar hanya import dari `index.ts`, bukan langsung ke file internal.
2. **Tidak ada cross-feature import langsung**: Feature A tidak boleh import internal Feature B. Jika butuh data, lewat shared API layer atau compose di page level.
3. **Shared layer**: Komponen/logika yang dipakai multiple features ada di `shared/`.
4. **Pages compose features**: Page-level components menyusun multiple features menjadi satu halaman.

---

## Data Flow: Client ↔ Server

```
React Component
    ↓ (useQuery / useMutation)
Feature Hook (e.g., useActivities)
    ↓
Feature API (e.g., activities.api.ts)
    ↓ (Axios with credentials)
Express Route (/api/activities)
    ↓
Controller (ActivityController)
    ↓ (resolve from DI container)
Use Case (GetActivities)
    ↓ (via interface)
Repository (ActivityRepository interface → SupabaseActivityRepository)
    ↓
Supabase (PostgreSQL)
```

### Auth Flow (JWT httpOnly Cookie)

```
1. User click "Login with Strava"
2. Redirect → Strava OAuth consent screen
3. Strava redirect → /api/auth/callback?code=xxx
4. Backend: tukar code dengan access_token & refresh_token Strava
5. Backend: simpan token Strava ke tabel users
6. Backend: generate JWT, set di httpOnly cookie
7. Redirect → frontend dashboard
8. Setiap request FE → BE: cookie otomatis terkirim (Axios withCredentials)
9. Backend middleware: verify JWT, inject user ke request
```

### Strava Sync Flow

```
1. User click "Sync Now" atau sync otomatis saat login
2. FE → POST /api/sync
3. BE: cek token Strava, refresh jika expired
4. BE: GET /athlete/activities dari Strava API (filter type=Ride)
5. BE: untuk setiap aktivitas baru:
   a. Simpan ke tabel activities (dengan bike_id jika terlink)
   b. Update bikes.current_km
   c. Update components.current_km (semua komponen aktif di bike tersebut)
   d. Cek maintenance_schedules → trigger alert jika due
   e. Update goals.current_value (goal aktif yang relevan)
6. BE: return summary sync
7. FE: invalidate React Query cache → refetch dashboard
```
