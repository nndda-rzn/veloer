# 10 — Phase 2 Completion Plan

Daftar lengkap pekerjaan yang **belum selesai** setelah release v2.0.0. Diupdate secara berkala saat progress berjalan.

> **Status terakhir**: v2.0.0 released, 7 modul inti berfungsi, tapi ada integrasi dan fitur training yang masih missing.

---

## Ringkasan Yang Belum Selesai

| #   | Bagian                                             | PR Target            | Status  |
| --- | -------------------------------------------------- | -------------------- | ------- |
| 1   | Settings Page (server + client)                    | 2 PR                 | Pending |
| 2   | Goal auto-progress on sync                         | 1 PR                 | Pending |
| 3   | Auto-create transactions (maintenance + events)    | 1 PR                 | Pending |
| 4   | Strava training data (cadence, power, laps, zones) | 3 PR                 | Pending |
| 5   | Update docs status table                           | digabung PR terakhir | Pending |

**Total estimasi**: 7-8 PR

---

## Bagian 1: Settings Page

### 1A - Server: Profile Endpoints

**Branch**: `feature/server-profile-routes`

**Files**:

- `server/src/application/use-cases/auth/ProfileUseCases.ts` - GetProfile, UpdateProfile
- `server/src/interfaces/controllers/ProfileController.ts`
- `server/src/interfaces/routes/profile.routes.ts`
- `server/src/infrastructure/http/server.ts` - register /api/profile

**Endpoints**:

- `GET /api/profile` - return UserProfile
- `PATCH /api/profile` - update profile fields

**Use existing**: `UserProfileRepository` (findByUserId, update) sudah ada.

### 1B - Client: Settings UI

**Branch**: `feature/client-settings-ui`

**Komponen**:

- ProfileForm - display_name, avatar
- PreferencesSection - units (metric/imperial), currency, timezone
- DefaultBikeSelector - dropdown dari /api/bikes
- StravaConnection - status koneksi Strava, strava_id
- FtpSetting - input FTP (untuk training load, lihat Bagian 4)
- LogoutButton - panggil authApi.logout()

---

## Bagian 2: Goal Auto-Progress on Sync

**Branch**: `feature/server-goal-auto-progress`

**File utama**: `server/src/application/use-cases/activity/SyncStravaActivities.ts`

**Perubahan**:

- Inject `GetGoals` dan `UpdateGoalProgress` via `@inject()` (pelajaran dari PR #37!)
- Register `GetGoals` dan `UpdateGoalProgress` sebagai singleton di DI container
- Setelah insert aktivitas baru, fetch active goals via `GetGoals.executeActive()`
- Untuk setiap goal, hitung kontribusi berdasarkan type:

| Goal Type          | Kontribusi per Activity | Rumus                           |
| ------------------ | ----------------------- | ------------------------------- |
| `distance`         | km                      | `activity.distance / 1000`      |
| `time`             | hours                   | `activity.moving_time / 3600`   |
| `elevation`        | meters                  | `activity.total_elevation_gain` |
| `activities_count` | count                   | `1` per activity                |

- Panggil `UpdateGoalProgress.execute(goalId, additionalValue)` per goal
- Auto-complete saat `current_value >= target_value` (sudah ada di repo)

**Catatan**: Hanya aktivitas yang baru di-sync (belum ada di DB) yang kontribusi ke goal progress.

---

## Bagian 3: Auto-Create Transactions

**Branch**: `feature/server-auto-transactions`

### 3A - Maintenance Cost -> Transaction

**File**: `server/src/application/use-cases/maintenance/MaintenanceLogUseCases.ts`

**Perubahan**:

- Inject `AddTransaction` ke `LogMaintenance` use case
- Setelah create maintenance log, jika `cost > 0`:
  - Auto-create transaction:
    - `type`: `expense`
    - `category`: `maintenance`
    - `amount`: `cost`
    - `date`: `service_date`
    - `description`: `[Maintenance] {type}: {description}`
    - `bike_id`: dari maintenance log

### 3B - Event Registration Fee -> Transaction

**File**: `server/src/interfaces/controllers/EventController.ts` atau buat use case `CompleteEvent`

**Perubahan**:

- Saat update event status ke `completed` dan `registration_fee > 0`:
  - Auto-create transaction:
    - `type`: `expense`
    - `category`: `event`
    - `amount`: `registration_fee`
    - `date`: `event.date`
    - `description`: `[Event] {event.name}`

**Catatan**: Cek apakah transaction sudah ada untuk event ini (hindari duplicate jika update dipanggil 2x).

---

## Bagian 4: Strava Training Data

Data training komprehensif dari Strava: cadence, power, calories, laps, zones, dan training load analysis.

### 4A - Server: Expand Strava API + DB Migration

**Branch**: `feature/server-training-data-schema`

**Files**:

- `server/src/application/ports/StravaPort.ts` - expand StravaActivity + tambah StravaLap, StravaZone
- `server/src/infrastructure/strava/StravaAdapter.ts` - implement getActivityLaps, getActivityZones
- `server/src/domain/entities/activity/Activity.ts` - tambah field training
- `server/src/infrastructure/database/repositories/activity/SupabaseActivityRepository.ts`
- `server/src/application/use-cases/activity/SyncStravaActivities.ts` - capture field baru
- `supabase/migrations/012_add_training_fields.sql`

**Field StravaActivity baru**:

- `average_cadence`, `max_cadence` (RPM)
- `average_watts`, `max_watts`, `weighted_average_watts` (watt)
- `kilojoules`, `device_watts` (boolean)
- `average_temp`, `calories`
- `elev_high`, `elev_low`

**Interface baru**:

```typescript
interface StravaLap {
  id: number;
  lap_index: number;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  average_speed: number;
  max_speed: number;
  average_heartrate: number | null;
  max_heartrate: number | null;
  average_cadence: number | null;
  average_watts: number | null;
  lap_type: string | null;
}

interface StravaZone {
  sensor_type: 'heartrate' | 'power';
  distribution_buckets: { min: number; max: number; time: number }[];
}
```

**StravaPort methods baru**:

- `getActivityLaps(accessToken, id): Promise<StravaLap[]>`
- `getActivityZones(accessToken, id): Promise<StravaZone[]>`

**DB Migration 012**: ALTER TABLE activities ADD COLUMN average_cadence, max_cadence, average_watts, max_watts, weighted_average_watts, kilojoules, device_watts, average_temp, calories, elev_high, elev_low

### 4B - Server: Laps + Zones Endpoints

**Branch**: `feature/server-laps-zones-routes`

**Files**:

- `server/src/application/use-cases/activity/GetActivityLaps.ts`
- `server/src/application/use-cases/activity/GetActivityZones.ts`
- `server/src/interfaces/controllers/ActivityController.ts` - tambah getLaps, getZones
- `server/src/interfaces/routes/activity.routes.ts` - tambah GET /:id/laps, GET /:id/zones

**Endpoints**:

- `GET /api/activities/:id/laps` - fetch laps dari Strava real-time (refresh token jika perlu)
- `GET /api/activities/:id/zones` - fetch zones dari Strava real-time

**Catatan**: Data laps dan zones TIDAK disimpan di DB (terlalu besar). Fetch on-demand saat user buka detail page.

### 4C - Client: Training Data UI

**Branch**: `feature/client-training-ui`

**Files**:

- `client/src/features/activity/types/activity.ts` - expand Activity type
- `client/src/features/activity/api/activity.api.ts` - tambah getLaps, getZones
- `client/src/features/activity/components/LapBreakdown.tsx` - tabel per-lap
- `client/src/features/activity/components/ZoneChart.tsx` - Recharts stacked bar
- `client/src/features/activity/components/TrainingLoadSummary.tsx` - IF, TSS, training load
- `client/src/features/activity/components/ActivityDetail.tsx` - tambah metrics cards
- `client/src/pages/ActivityDetailPage.tsx` - tambah tab Training

**Komponen detail**:

**LapBreakdown** - Tabel per-lap:

| Lap # | Distance | Time  | Avg HR | Avg Cadence | Avg Power | Lap Type |
| ----- | -------- | ----- | ------ | ----------- | --------- | -------- |
| 1     | 10.0 km  | 15:30 | 145    | 85          | 220       | Interval |
| 2     | 5.0 km   | 07:20 | 165    | 90          | 280       | Recovery |

**ZoneChart** - Recharts stacked bar:

- HR Zones: Z1 (Recovery), Z2 (Endurance), Z3 (Tempo), Z4 (Threshold), Z5 (VO2 Max)
- Power Zones: Z1 (Active Recovery), Z2 (Endurance), Z3 (Tempo), Z4 (Lactate Threshold), Z5 (VO2 Max), Z6 (Anaerobic), Z7 (Sprint)
- Warna: Z1 biru, Z2 hijau, Z3 kuning, Z4 oranye, Z5 merah, Z6 ungu, Z7 pink

**TrainingLoadSummary**:

- Intensity Factor (IF) = weighted_average_watts / FTP
- TSS (Training Stress Score) = (duration_hours * IF^2 * 100)
- FTP didapat dari Settings Page (Bagian 1B)
- Tampilkan: IF, TSS, average power, normalized power

---

## Bagian 5: Update Docs Status

**Branch**: digabung dengan PR terakhir (4C)

**Files**:

- `docs/09-implementation-phases.md` - update semua status dari Pending ke Done
- `README.md` - update status table dengan training features

---

## Urutan Eksekusi

| Urut | Branch                                | Estimasi Files      | Dependency       |
| ---- | ------------------------------------- | ------------------- | ---------------- |
| 1    | `feature/server-profile-routes`       | 4 new               | -                |
| 2    | `feature/client-settings-ui`          | 7 new + 1 mod       | PR 1             |
| 3    | `feature/server-goal-auto-progress`   | 2 mod               | -                |
| 4    | `feature/server-auto-transactions`    | 2 mod               | -                |
| 5    | `feature/server-training-data-schema` | 5 mod + 1 migration | -                |
| 6    | `feature/server-laps-zones-routes`    | 3 new + 2 mod       | PR 5             |
| 7    | `feature/client-training-ui`          | 5 new + 3 mod       | PR 2 (FTP), PR 6 |
| 8    | `feature/docs-final-update`           | 2 mod               | Semua selesai    |

---

## Catatan Penting

### Strava API Rate Limits

- 200 requests / 15 menit
- 1000 requests / hari
- Laps + zones fetch on-demand (tidak cached di server)
- Pertimbangkan caching sederhana di memory untuk laps/zones (TTL 5 menit)

### Cadence/Power Availability

- Tidak semua Strava activity punya cadence/power sensor
- UI harus handle null values gracefully (tampilkan "-" jika tidak ada data)
- `device_watts = true` berarti power meter asli, `false` berarti estimated power

### FTP (Functional Threshold Power)

- Diperlukan untuk training load analysis (TSS, IF)
- User input manual di Settings Page
- Default: 250W (rata-rata cyclist recreational)
- Bisa auto-estimate nanti: 95% of best 20-min power

### DB Migration

- Jalankan `012_add_training_fields.sql` di Supabase SQL Editor setelah PR 5 merged
- Migration menambah kolom ke tabel `activities` (nullable, tidak break data lama)

### DI Injection Pattern

- Selalu gunakan `@inject(ClassName)` decorator untuk class reference injection
- Register sebagai singleton di `dependencies.ts`
- Pelajaran dari bug PR #37: tsx/esbuild tidak emit decorator metadata

---

## Checklist per PR

Setiap PR harus memenuhi:

- [ ] `tsc --noEmit` pass (server + client)
- [ ] ESLint pass (lint-staged otomatis)
- [ ] Prettier pass (lint-staged otomatis)
- [ ] CI GitHub Actions pass
- [ ] Tidak break fitur yang sudah ada
- [ ] Commit message conventional (`feat(...)` atau `fix(...)`)
- [ ] Body max 100 chars per line (commitlint)
