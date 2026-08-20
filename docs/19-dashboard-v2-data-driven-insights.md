# 19 — Dashboard v2: Data-Driven Insights (v3.2.0)

Redesign dashboard dari "kumpulan angka statis" menjadi command center yang menjawab tiga pertanyaan: seberapa baik performa, membaik atau memburuk, dan apa yang harus dilakukan hari ini.

---

## Latar Belakang

Dashboard lama terlalu biasa karena hanya menampilkan total kumulatif tanpa konteks:

- **KPI statis** — "1,200 km" tanpa perbandingan = tidak bisa ditindaklanjuti
- **Fitur training disembunyikan** — API `getLoadHistory()` (CTL/ATL/TSS 8 minggu) dan `getFitnessAnalysis()` (FTP estimasi) sudah ada di backend sejak v2.9.0 tapi tidak pernah tampil di dashboard
- **Goal tanpa deadline insight** — progress ring tanpa "sisa X hari" / "butuh Y/minggu"
- **8 request waterfall** via `Promise.all` — satu error mematikan seluruh dashboard, tanpa cache
- **Angka duplikat** — hero, KPI, dan summary menampilkan total yang sama

## Prinsip Desain

| Prinsip                    | Penerapan                                                         |
| -------------------------- | ----------------------------------------------------------------- |
| Data punya konteks         | Setiap KPI dilengkapi tren vs periode sebelumnya                  |
| Angka bisa ditindaklanjuti | Goal: "X hari lagi, butuh Y/minggu"; Budget: progress vs limit    |
| Fitur pembeda ditampilkan  | Training Load (CTL/ATL/TSS/FTP) bukan fitur tersembunyi           |
| Partial load               | React Query per-anjing: satu widget gagal tidak merusak dashboard |
| Loading skeleton           | Tiap widget punya skeleton sendiri, tidak menggantung             |

---

## Fase 1 — Fondasi Data (React Query)

### `client/src/features/dashboard/lib/metrics.ts` (baru)

Pure utilities + query helpers. Semua testable, tanpa efek samping.

| Helper                                   | Deskripsi                                         |
| ---------------------------------------- | ------------------------------------------------- |
| `lastDaysNDays(n)`                       | Rentang N hari terakhir (YYYY-MM-DD)              |
| `monthToDate()` / `previousMonthRange()` | Rentang bulan berjalan / bulan lalu               |
| `previousRange(range, n)`                | Rentang N hari sebelum suatu rentang              |
| `pctChange(cur, prev)`                   | Delta + persen, null-safe saat prev = 0           |
| `trendDirection(change)`                 | `'up' \| 'down' \| 'flat' \| 'new'`               |
| `daysLeft(start, end)`                   | Total durasi + sisa hari + overdue                |
| `requiredPerWeek(gap, end)`              | Pace per minggu untuk mengejar target             |
| `formFromLoad(ctl, atl)`                 | Status form: fresh / balanced / fatigued / rested |
| `activeBudgetTotal(budgets)`             | Limit budget aktif (prioritas kategori `total`)   |

### `client/src/features/dashboard/hooks/useDashboardData.ts` (refactor)

Ganti `useState/useEffect` + `Promise.all` dengan **11 `useQuery` independen**:

| Query                  | Key                               | Sumber                     |
| ---------------------- | --------------------------------- | -------------------------- |
| Stats 7d               | `['dashboard','stats',range]`     | `getStats(range)`          |
| Stats 7d sebelumnya    | `['dashboard','stats',prevRange]` | `getStats(prevRange)`      |
| Recent activities      | `['dashboard','recent']`          | `list({limit:5})`          |
| Bikes                  | `['dashboard','bikes']`           | `bikeApi.list()`           |
| Due schedules          | `['dashboard','due']`             | `getDueSchedules()`        |
| Finance bulan berjalan | `['dashboard','finance']`         | `getSummary(monthToDate)`  |
| Budgets                | `['dashboard','budgets']`         | `listBudgets()`            |
| Goals aktif            | `['dashboard','goals']`           | `goalApi.list(true)`       |
| Events mendatang       | `['dashboard','events']`          | `eventApi.list(true)`      |
| Profile                | `['dashboard','profile']`         | `settingsApi.getProfile()` |
| Load history           | `['dashboard','load']`            | `getLoadHistory()`         |
| Fitness analysis       | `['dashboard','fitness']`         | `getFitnessAnalysis()`     |

Catatan:

- `staleTime: 5 menit` global (providers) + `10 menit` untuk query training (mahal)
- Error global hanya dari query **inti** — load/fitness opsional gagal tidak memunculkan banner
- Setiap query return `data ?? []` / `?? null`, sehingga render partial aman

---

## Fase 2 — KPI Trend-Aware

### `KpiCard.tsx`

Props baru:

- `trend?: { current, previous, higherIsBetter?, format?, unit? }` — chip delta "% vs prev 7d" dengan panah ↑/↓/– dan warna semantik
  - Hijau = naik (metrik "semakin besar semakin baik")
  - Merah = turun; mode `higherIsBetter: false` untuk metrik kebalikan
  - `'new'` state saat prev = 0 (tidak ada data pembanding)
- `progress?: { spent, budget, formatter }` — progress bar budget dengan warna merah saat over
- `loading?: boolean` — skeleton

### Dashboard (5 KPI)

| KPI            | Value                | Context                                       |
| -------------- | -------------------- | --------------------------------------------- |
| Distance (7d)  | `formatDistance`     | tren % vs prev 7d                             |
| Rides (7d)     | count                | tren % vs prev 7d                             |
| Elevation (7d) | meter                | tren % vs prev 7d                             |
| Active Bikes   | jumlah aktif         | hint: total • N perlu perhatian               |
| Monthly Spend  | `formatIDR(expense)` | progress bar vs active budget + balance bulan |

---

## Fase 3 — Training Load Card

### `client/src/features/dashboard/components/TrainingLoadCard.tsx` (baru)

Menggabungkan data dari API yang sudah ada:

- **Chart** `TrainingLoadChart` (di-embed via prop `embedded`) — bar Daily TSS + line CTL (hijau primary) dan ATL (oranye)
- **Chip form** dari `formFromLoad(ctl, atl)`:
  - `Fresh` (CTL ≥ ATL + 10) — teal
  - `Balanced` — blue
  - `Fatigued` (ATL > CTL) — amber
  - `No recent load` — gray
- **Stat pill**: Est. FTP + Weekly TSS dari `FitnessAnalysis`
- **Warning confidence rendah** (`ftp_confidence: 'low'`) sebagai teks penambahan
- Empty state ramah saat tidak ada data power meter — card tidak merusak layout

### `TrainingLoadChart.tsx`

- Tambah prop `embedded?: boolean` — menghilangkan wrapper card duplikat saat dipakai dalam `TrainingLoadCard`
- Warna CTL diganti ke primary green (`#16a34a`), grid + tooltip dimurnikan
- `tickFormatter` tanggal: `"Aug 12"` bukan `"2026-08-12"`

---

## Fase 4 — Goals Dengan Deadline Insight

### `GoalProgress.tsx`

- Progress ring + persen + `current/target`
- Insight per goal:
  - **Goal tercapai** → centang hijau "Goal reached"
  - **Terlambat** → "Overdue by X days" merah
  - **Aktif** → "X days left · Y unit/week" (dari `requiredPerWeek`)
- Layout: list vertikal dengan info jelas, bukan ikon grid yang ambigu
- Empty state: CTA "Create Goal" → `/goals`

---

## Fase 5 — Hierarchy & Polish

```
BikeHero (greeting + default bike switch, skeleton saat load)
[5 KPI cards dengan tren]
Alerts: fitness warnings + maintenance due
GRID 3 kolom:
  Kiri (2/3): TrainingLoadCard → WeeklyDistanceChart (7d vs prev) → RecentActivities
  Kanan (1/3): GoalProgress → UpcomingWorkouts → BudgetSummary → UpcomingEvents
```

- `BikeHero` mendapat `loading` prop — skeleton hero tanpa flash konten kosong
- `WeeklyDistanceChart` diubah menjadi "Activity Summary — Last 7 days" dengan delta kecil per indikator
- Fitness warnings tampil sebagai Alert warning di atas maintenance alerts

---

## Definition of Done

1. `npm run type-check` clean
2. `npm run build` sukses
3. KPI menampilkan tren vs periode sebelumnya (bukan angka mentah)
4. Budget pengeluaran memakai rentang bulan berjalan (bukan 7d)
5. Training Load (CTL/ATL/TSS/FTP) tampil di dashboard tanpa jerry modif backend
6. Goals menampilkan deadline + pace per minggu
7. Error query opsional (load/fitness) tidak memunculkan banner global
8. Loading state per widget; dashboard tetap render saat satu query gagal
9. Zero request waterfall — semua via React Query
10. Tidak ada komentar baru di kode (sesuai aturan repo)

## Risiko & Mitigasi

| Risiko                                                      | Mitigasi                                                    |
| ----------------------------------------------------------- | ----------------------------------------------------------- |
| Load history / fitness kosong tanpa power meter             | Card tetap render dengan empty state + copy edukatif        |
| Division by zero saat prev = 0                              | `pctChange` mengembalikan `percent: null` → state "New"     |
| 12 query paralel memberatkan                                | React Query cache + staleTime, query opsional = 10 menit    |
| Budget milik periode lain ikut terhitung                    | `activeBudgetTotal` memfilter `is_active` + rentang tanggal |
| `current_km` di hero vs total jarak aktivitas membingungkan | Label diperjelas; hero fokus ke bike selected               |

---

## Status

| Fase | Deskripsi                                      | Status |
| ---- | ---------------------------------------------- | ------ |
| 1    | Fondasi data React Query + metrics             | ✅     |
| 2    | KPI trend-aware + budget progress              | ✅     |
| 3    | Training Load card terintegrasi                | ✅     |
| 4    | Goals deadline insight                         | ✅     |
| 5    | Hierarchy + polish loading states              | ✅     |
| —    | Docs `19-dashboard-v2-data-driven-insights.md` | ✅     |
