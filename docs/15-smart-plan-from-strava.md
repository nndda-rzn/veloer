# 15 — Smart Plan dari Data Strava (v2.9.0)

Fitur baru: generate training plan berdasarkan analisis histori aktivitas Strava user, bukan dari input manual.

---

## Latar Belakang

Template library yang ada (v2.7.0) menggunakan FTP dari Settings dan parameter statis. User harus tahu FTP-nya sendiri dan pilih template yang cocok secara manual. Fitur ini menambah opsi "Smart Plan" yang menganalisis data Strava dan menghasilkan rekomendasi plan yang disesuaikan dengan kondisi fitness aktual user.

---

## Tujuan

- Analisis histori aktivitas Strava yang sudah di-sync
- Estimasi FTP dari best effort yang ada
- Rekomendasikan template yang sesuai dengan fitness level saat ini
- Pre-fill form dengan parameter yang sudah disesuaikan
- User bisa adjust sebelum confirm
- Tampilkan warning jika data Strava masih sedikit (< 10 rides)

---

## Flow

```
Tombol "Smart Plan" di TrainingPlansPage
  ↓
GET /api/training-plans/fitness-analysis
  ↓
SmartPlanModal tampilkan hasil analisis + form adjust
  ↓
User adjust FTP baseline, template, start date
  ↓
POST /api/training-plans/from-template (dengan parameter yang sudah disesuaikan)
  ↓
Redirect ke plan detail
```

---

## Data yang Dianalisis dari Strava

| Field Aktivitas      | Digunakan untuk                    |
| -------------------- | ---------------------------------- |
| `weighted_avg_watts` | Estimasi FTP (best NP × 0.95)      |
| `avg_watts`          | Fallback jika tidak ada NP         |
| `moving_time`        | Rata-rata weekly volume (jam)      |
| `tss`                | Rata-rata weekly TSS, CTL saat ini |
| `avg_hr`, `max_hr`   | Fallback LTHR jika tidak ada power |
| `start_date`         | Hitung minggu aktif, konsistensi   |

### Logic Estimasi FTP

```
1. Ambil semua aktivitas dengan weighted_avg_watts > 0
2. Urutkan berdasarkan weighted_avg_watts DESC
3. estimated_ftp = best weighted_avg_watts × 0.95
4. Jika tidak ada power data → gunakan FTP dari Settings sebagai fallback
5. ftp_confidence:
   - 'high'   = 10+ aktivitas dengan power data
   - 'low'    = 3-9 aktivitas dengan power data
   - 'none'   = 0-2 aktivitas atau tidak ada power data
```

### Logic Rekomendasi Template

```
if (ctl < 20 || activity_count < 5)    → BASE_BUILD_4W
if (ctl >= 20 && ctl < 40)             → FTP_BUILDER_6W
if (ctl >= 40 && avg_weekly_hours < 6) → CENTURY_PREP_8W
if (ctl >= 40 && avg_weekly_hours >= 6) → GRAN_FONDO_12W
```

### Logic Weekly Volume

```
weeks = (date of last activity - date of first activity) / 7
avg_weekly_hours = total moving_time (jam) / max(weeks, 1)
avg_weekly_tss   = total tss / max(weeks, 1)
```

### Warnings

| Kondisi                   | Warning                                                                                         |
| ------------------------- | ----------------------------------------------------------------------------------------------- |
| activity_count < 5        | "Only X activities synced — estimates may not be accurate. Sync more rides for better results." |
| ftp_confidence === 'none' | "No power data found — FTP estimate is based on your Settings value."                           |
| ftp_confidence === 'low'  | "Limited power data — FTP estimate may not reflect your current fitness."                       |
| avg_weekly_hours < 2      | "Low weekly volume detected — starting with Base Build is recommended."                         |

---

## Implementasi

### PR #98 — Server: `AnalyzeStravaFitness` use-case + endpoint

**Branch:** `feat/fitness-analysis-endpoint`
**File baru:** `server/src/application/use-cases/training/AnalyzeStravaFitness.ts`
**File diubah:** `server/src/interfaces/controllers/TrainingPlanController.ts`
**File diubah:** `server/src/interfaces/routes/training.routes.ts`

**Interface:**

```typescript
export interface FitnessAnalysis {
  estimated_ftp: number; // dari best NP, atau FTP dari Settings sebagai fallback
  ftp_confidence: 'high' | 'low' | 'none';
  avg_weekly_hours: number;
  avg_weekly_tss: number;
  ctl: number;
  activity_count: number;
  suggested_template: TemplateKey;
  suggested_ftp_baseline: number; // sama dengan estimated_ftp
  warnings: string[];
}
```

**Endpoint:** `GET /api/training-plans/fitness-analysis`

**Dependencies:** `ActivityRepository`, `UserProfileRepository`

---

### PR #99 — Client: type + API + hook

**Branch:** `feat/fitness-analysis-client`
**File diubah:** `client/src/features/training/types/training.ts` — tambah `FitnessAnalysis` interface
**File diubah:** `client/src/features/training/api/training.api.ts` — tambah `getFitnessAnalysis()`
**File baru:** `client/src/features/training/hooks/useFitnessAnalysis.ts`
**File diubah:** `client/src/features/training/index.ts` — export hook baru

---

### PR #100 — Client: `SmartPlanModal` component

**Branch:** `feat/smart-plan-modal`
**File baru:** `client/src/features/training/components/SmartPlanModal.tsx`

**Layout modal:**

```
┌─────────────────────────────────────────────┐
│ Smart Plan                                  │
├─────────────────────────────────────────────┤
│ Your Strava Analysis                        │
│ Based on X activities                       │
│                                             │
│  CTL: XX   Avg X hrs/week   Est. FTP: XXXw  │
│                                             │
│ ⚠ Warning messages (jika ada)              │
├─────────────────────────────────────────────┤
│ Recommended Plan                            │
│                                             │
│ Template:    [Base Build 4W ▼]              │
│ FTP Baseline: [___] W                       │
│ Start Date:  [________]                     │
│ Title:       [Base Build — auto-filled]     │
├─────────────────────────────────────────────┤
│            [Cancel]  [Create Plan]          │
└─────────────────────────────────────────────┘
```

**Props:**

```typescript
interface SmartPlanModalProps {
  analysis: FitnessAnalysis;
  defaultFtp: number; // dari Settings sebagai ultimate fallback
  onConfirm: (
    template: TemplateKey,
    startDate: string,
    ftpBaseline: number,
    title?: string,
  ) => Promise<void>;
  onCancel: () => void;
}
```

**Behavior:**

- Pre-fill semua field dari `analysis` hasil API
- User bisa ganti template (semua 4 template tetap tersedia)
- User bisa ganti FTP baseline
- User bisa ganti start date
- User bisa ganti title (auto-generate tapi editable)
- Tombol Create Plan disabled saat loading

---

### PR #101 — Client: Integrasi ke `TrainingPlansPage`

**Branch:** `feat/smart-plan-integration`
**File diubah:** `client/src/pages/TrainingPlansPage.tsx`

**Perubahan:**

- Tambah state `showSmartPlan` dan `fitnessAnalysis`
- Tambah tombol "Smart Plan" di sebelah "From Template"
- Saat tombol diklik: fetch `getFitnessAnalysis()`, tampilkan loading, lalu buka `SmartPlanModal`
- Setelah confirm: panggil `trainingApi.createFromTemplate()` dengan parameter yang sudah disesuaikan

**Tombol:**

```
[+ New Plan]  [From Template]  [Smart Plan ✦]
```

---

## Catatan Teknis

- **Data sedikit (kasus 3 aktivitas):** Sistem tetap berjalan, estimasi mungkin tidak akurat, tapi warning ditampilkan dengan jelas
- **Tidak ada power data:** `estimated_ftp` fallback ke `profile.ftp ?? 250`, confidence = 'none'
- **Template yang disuggest tetap bisa diubah:** User tidak dipaksa pakai suggestion
- **FTP dari analisis otomatis update `ftp_baseline` plan**, bukan Settings — Settings FTP tidak berubah
- **Dependency CTL:** Ambil dari `GetTrainingLoadHistory` yang sudah ada atau hitung ulang di use-case baru (pilih hitung ulang agar tidak circular dependency)

---

## Status

| PR   | Deskripsi                                             | Status     |
| ---- | ----------------------------------------------------- | ---------- |
| #98  | Server: AnalyzeStravaFitness use-case + endpoint      | ⬜ Pending |
| #99  | Client: FitnessAnalysis type + API + hook             | ⬜ Pending |
| #100 | Client: SmartPlanModal component                      | ⬜ Pending |
| #101 | Client: Integrasi SmartPlanModal ke TrainingPlansPage | ⬜ Pending |

---

## Migration

Tidak ada migration database yang diperlukan untuk fitur ini.
Semua analisis dilakukan on-the-fly dari data aktivitas yang sudah ada.
