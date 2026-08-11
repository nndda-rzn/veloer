# 14 — Strava-Training Integration Improvements (v2.8.0)

Perbaikan integrasi antara data Strava dan modul Training Plans berdasarkan audit codebase v2.7.0.

---

## Latar Belakang

Setelah UI/UX redesign selesai (v2.7.0), seluruh infrastruktur server-side Training Plans sudah berfungsi penuh:

- `SyncStravaActivities` auto-link aktivitas ke planned workout saat sync
- `GenerateRecommendation` hitung CTL/ATL/TSB dari 42 hari aktivitas
- `GetPlanRetrospective` hitung completion rate, TSS compliance, FTP change
- `GeneratePlanFromTemplate` buat plan dari 4 template

Namun ada 4 gap yang perlu diperbaiki agar integrasi bekerja optimal.

---

## Kondisi Aktual (Audit v2.7.0)

### Yang sudah bekerja

| Komponen                                                          | Status                       |
| ----------------------------------------------------------------- | ---------------------------- |
| Server training use-cases (semua 6 file)                          | ✅ Complete                  |
| Client training pages (TrainingPlansPage, TrainingPlanDetailPage) | ✅ Complete                  |
| Client training components (12 komponen)                          | ✅ Complete                  |
| Client training hooks (usePlans, useWorkouts, useRecommendation)  | ✅ Complete                  |
| Client training API layer (training.api.ts)                       | ✅ Complete                  |
| Migrations 014 + 015                                              | ✅ Sudah dijalankan          |
| TSS dari power meter                                              | ✅ Akurat (Normalized Power) |

### Gap yang perlu diperbaiki

| Gap                                                            | Dampak                                              | Prioritas |
| -------------------------------------------------------------- | --------------------------------------------------- | --------- |
| Client `SyncResult` type tidak include `workoutsLinked`        | Counter auto-linked tidak tampil di UI setelah sync | Tinggi    |
| Auto-link hanya cocokkan durasi ±30 menit, tidak tipe workout  | Recovery ride bisa ke-match ke threshold session    | Tinggi    |
| TSS = null untuk aktivitas tanpa power (HR-only)               | CTL/ATL/TSB = 0 jika tidak ada power meter          | Medium    |
| TrainingLoadChart belum diverifikasi render dengan data aktual | Chart mungkin kosong atau tidak akurat              | Medium    |

---

## Plan Perbaikan

### PR #94 — Fix: client SyncResult type + tampilkan workoutsLinked di UI

**Scope:** 1–2 file client-side
**Branch:** `fix/sync-result-workouts-linked`

**Masalah:**
Server sudah return `workoutsLinked` dalam `SyncResult`:

```typescript
// server/src/application/use-cases/activity/SyncStravaActivities.ts:10-16
export interface SyncResult {
  synced: number;
  skipped: number;
  total: number;
  goalsUpdated: number;
  workoutsLinked: number; // ← sudah ada di server
}
```

Client belum menampilkan field ini ke user setelah sync berhasil.

**Fix yang diperlukan:**

1. Cari dimana `SyncResult` di-type di client (kemungkinan di `client/src/features/strava/`)
2. Tambah `workoutsLinked: number` ke interface client-side
3. Tampilkan di toast/banner setelah sync: "Synced X activities, linked Y workouts"

**File yang mungkin perlu diubah:**

- `client/src/features/strava/types/` atau `api/`
- Komponen yang menampilkan hasil sync (sync button / dashboard)

---

### PR #95 — Fix: auto-link pakai workout type scoring

**Scope:** 1 file server-side
**Branch:** `fix/auto-link-workout-type-scoring`

**Masalah:**
`SyncStravaActivities.ts:110-115` — match logic saat ini:

```typescript
// Hanya cek: status === 'planned' && |duration - target| <= 30 menit
// Tidak mempertimbangkan tipe workout vs intensitas aktivitas
```

Akibatnya recovery ride 35 menit bisa ke-match ke threshold interval 45 menit karena durasi berdekatan.

**Fix yang diperlukan:**
Tambah intensity scoring berdasarkan `average_watts / ftp` ratio:

| Ratio (NP/FTP) | Zone | Workout Types yang cocok            |
| -------------- | ---- | ----------------------------------- |
| < 0.55         | Z1   | recovery                            |
| 0.55–0.75      | Z2   | endurance                           |
| 0.75–0.87      | Z3   | tempo                               |
| 0.87–0.95      | Z4   | sweet_spot                          |
| 0.95–1.05      | Z5   | threshold                           |
| > 1.05         | Z6+  | vo2max, anaerobic, interval, sprint |

Scoring:

- Durasi match dalam ±30 menit: +2 poin
- Durasi match dalam ±15 menit: +1 poin tambahan
- Workout type match dengan zone aktivitas: +3 poin
- Pilih workout dengan skor tertinggi (bukan first match)

**File yang diubah:**

- `server/src/application/use-cases/activity/SyncStravaActivities.ts`

---

### PR #96 — Fix: hrTSS fallback untuk aktivitas tanpa power meter

**Scope:** 1 file server-side + 1 migration Supabase
**Branch:** `fix/hr-tss-fallback`

**Masalah:**
Saat ini jika aktivitas tidak punya `weighted_average_watts`, TSS = null:

```typescript
// SyncStravaActivities.ts:64 (estimasi)
const tss = ftp && np ? Math.round(((duration / 3600) * np * IF) / ftp) * 100) : null;
```

Jika riding HR-only, semua TSS = null → CTL/ATL/TSB tidak bisa dihitung.

**Fix yang diperlukan:**
Formula hrTSS (Coggan):

```
hrTSS = (duration_sec × avg_hr × duration_sec) / (LTHR × 3600) × 100
```

Fallback chain:

1. Jika ada power → gunakan NP-based TSS (existing)
2. Jika tidak ada power + ada HR + ada LTHR di profile → gunakan hrTSS
3. Jika tidak ada power + ada HR + tidak ada LTHR → estimasi LTHR = max_hr × 0.88
4. Jika tidak ada power + tidak ada HR → TSS = null (tidak berubah)

**Migration yang diperlukan:**
`supabase/migrations/016_add_lthr_to_profiles.sql`

```sql
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS lthr integer;
COMMENT ON COLUMN user_profiles.lthr IS 'Lactate Threshold Heart Rate (bpm)';
```

**File yang diubah:**

- `supabase/migrations/016_add_lthr_to_profiles.sql` (baru)
- `server/src/application/use-cases/activity/SyncStravaActivities.ts`
- `server/src/domain/entities/auth/User.ts` atau profile entity (tambah field lthr)
- `client/src/features/settings/` (tambah field LTHR di Settings)

**Catatan:** PR ini bisa dikerjakan terakhir jika user sudah pakai power meter. hrTSS hanya dibutuhkan sebagai fallback.

---

### PR #97 — Fix: verifikasi dan perbaiki TrainingLoadChart

**Scope:** 1–2 file client-side
**Branch:** `fix/training-load-chart`

**Masalah:**
`client/src/features/training/components/TrainingLoadChart.tsx` belum diverifikasi apakah:

1. Data CTL/ATL/TSB dari `GET /api/training-plans/recommendations` ter-render dengan benar
2. Chart menampilkan historical 42 hari atau hanya titik saat ini
3. Label dan axis sudah benar (CTL = biru, ATL = oranye, TSB = hijau/merah)

**Fix yang diperlukan:**

1. Buka `TrainingLoadChart.tsx` dan verifikasi data flow dari `useRecommendation` hook
2. Jika chart hanya tampilkan satu titik → perlu endpoint baru `GET /api/training-plans/load-history` yang return TSS per hari 42 hari terakhir
3. Jika endpoint baru diperlukan, tambah use-case `GetTrainingLoadHistory` di server

**Catatan:** Scope PR ini bisa melebar jika endpoint baru diperlukan. Verifikasi dulu sebelum implementasi.

---

## Urutan Pengerjaan

```
PR #94 (quick win, 30 menit)
  ↓
PR #95 (paling berdampak ke akurasi auto-link)
  ↓
PR #97 (verifikasi chart, scope bisa melebar)
  ↓
PR #96 (low priority jika sudah pakai power meter)
```

---

## Catatan Teknis

- **Power meter**: TSS sudah akurat dari NP (Normalized Power), PR #96 adalah fallback saja
- **Auto-link**: Saat sync, `workoutsLinked` sudah dihitung di server, hanya perlu ditampilkan di client
- **CTL/ATL window**: `GenerateRecommendation` pakai 42 hari, cukup untuk steady-state CTL
- **Sync limit**: Masih 30 aktivitas terakhir — historical backfill belum ada, CTL mungkin under-estimated untuk user baru sync pertama kali. Bisa jadi PR #98 di masa depan jika diperlukan.

---

## Status

| PR                        | Deskripsi                                       | Status    |
| ------------------------- | ----------------------------------------------- | --------- |
| #94                       | Fix SyncResult client type + UI                 | ✅ Merged |
| #95                       | Fix auto-link workout type scoring              | ✅ Merged |
| #96 (Training Load Chart) | TrainingLoadChart dengan 42-day CTL/ATL history | ✅ Merged |
| #97 (hrTSS fallback)      | hrTSS fallback + migration 016                  | ✅ Merged |

Semua perbaikan selesai di v2.8.0.
