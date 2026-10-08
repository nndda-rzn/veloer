# 05 — Modules

Detail 7 modul ERP, fitur masing-masing, dan integrasi antar modul.

---

## Modul 1: Activity Tracking

### Fungsi

Tracking aktivitas bersepeda dengan sync otomatis dari Strava. Menyediakan statistik, peta rute interaktif, dan riwayat lengkap.

### Fitur

- **Sync Strava**: Ambil semua aktivitas tipe `Ride` & `VirtualRide` dari Strava
- **Daftar aktivitas**: List dengan filter (date range, bike, type) & search (nama)
- **Detail aktivitas**: Peta rute interaktif (Leaflet), statistik lengkap
- **Statistik**: Total jarak/waktu/elevasi per periode, grafik tren
- **Link ke bike**: Setiap aktivitas bisa di-link ke sepeda tertentu

### Data Source

- **Strava API**: `GET /athlete/activities`, `GET /activities/{id}`
- Field yang diambil: `id, name, type, start_date, distance, moving_time, elapsed_time, total_elevation_gain, average_speed, max_speed, average_heartrate, max_heartrate, map.summary_polyline`

### Integrasi dengan Modul Lain

- ➡️ **Inventory**: Saat sync, update `bikes.current_km` & `components.current_km` (via trigger)
- ➡️ **Goals**: Update `goals.current_value` untuk goal aktif
- ➡️ **Events**: Bisa di-link ke event tertentu
- ➡️ **Finance**: Tidak otomatis (pengeluaran manual)

### Endpoint API

```
GET    /api/activities          # List dengan filter & pagination
GET    /api/activities/:id      # Detail
GET    /api/activities/stats    # Agregat statistik
POST   /api/sync                # Trigger sync Strava
```

---

## Modul 2: Bike & Gear Inventory

### Fungsi

Manajemen sepeda & komponen dengan tracking umur pakai berbasis jarak tempuh.

### Fitur

- **Multi-sepeda**: Tambah/edit/hapus sepeda (road, MTB, gravel, dll)
- **Komponen per sepeda**: Rantai, ban, rem, cassette, dll
- **Umur pakai**: Tracking `current_km` vs `expected_lifespan_km` per komponen
- **Indikator wear**: Visual indicator (hijau/kuning/merah) berdasarkan % umur terpakai
- **Status komponen**: active / replaced / failed
- **Foto sepeda**: Upload foto (opsional, via Supabase Storage)

### Indikator Wear Komponen

```
0% - 70%   → Hijau (masih baik)
70% - 90%  → Kuning (mulai perhatikan)
90% - 100% → Oranye (segera ganti)
> 100%     → Merah (overdue, wajib ganti)
```

### Integrasi dengan Modul Lain

- ⬅️ **Activity**: `current_km` di-update otomatis saat sync aktivitas
- ➡️ **Maintenance**: Komponen yang due trigger maintenance alert
- ➡️ **Finance**: Pembelian komponen baru → catat sebagai transaction
- ➡️ **Goals**: Tidak langsung
- ➡️ **Events**: Sepeda yang dipakai di event tercatat

### Endpoint API

```
GET    /api/bikes               # List semua sepeda
POST   /api/bikes               # Tambah sepeda
GET    /api/bikes/:id           # Detail sepeda + komponennya
PUT    /api/bikes/:id           # Update sepeda
DELETE /api/bikes/:id           # Hapus sepeda

GET    /api/bikes/:id/components # List komponen per sepeda
POST   /api/components           # Tambah komponen
PUT    /api/components/:id       # Update komponen
DELETE /api/components/:id       # Hapus komponen
```

---

## Modul 3: Maintenance Log

### Fungsi

Jadwal & riwayat maintenance dengan reminder berbasis jarak dan/atau waktu.

### Fitur

- **Service log**: Catat setiap maintenance (routine, repair, replacement, cleaning, tuning)
- **Maintenance schedule**: Reminder berulang berbasis `interval_km` dan/atau `interval_days`
- **Due alerts**: Notifikasi maintenance yang sudah due (jatuh tempo)
- **Wear tracker**: Visual tracking umur komponen vs maintenance terakhir
- **Cost tracking**: Biaya maintenance tercatat (terlink ke Finance)
- **Performed by**: Self-service atau shop (dengan nama shop)

### Logika Due Alert

```
Maintenance due jika:
  (next_due_km IS NOT NULL AND bike.current_km >= next_due_km)
  OR
  (next_due_date IS NOT NULL AND CURRENT_DATE >= next_due_date)
```

### Integrasi dengan Modul Lain

- ⬅️ **Inventory**: Schedule terlink ke bike & component
- ➡️ **Finance**: Setiap maintenance log bisa generate transaction (biaya)
- ➡️ **Dashboard**: Due alerts tampil di dashboard

### Endpoint API

```
GET    /api/maintenance/logs          # Riwayat maintenance
POST   /api/maintenance/logs          # Catat maintenance baru
GET    /api/maintenance/schedules     # List semua schedule
POST   /api/maintenance/schedules     # Tambah schedule
PUT    /api/maintenance/schedules/:id # Update schedule
DELETE /api/maintenance/schedules/:id # Hapus schedule
GET    /api/maintenance/due           # Maintenance yang due sekarang
```

---

## Modul 4: Finance Tracker

### Fungsi

Tracking pengeluaran terkait sepeda dengan budget bulanan & laporan.

### Fitur

- **Transactions**: Pemasukan & pengeluaran (gear, maintenance, event, nutrition, other)
- **Budget**: Set budget bulanan/tahunan per kategori (gear, maintenance, event, nutrition, other, atau `total`)
- **Budget progress**: Progress bar budget vs actual spending per kategori, dengan warna peringatan saat mendekati/melewati limit
- **Summary**: Total spending per bulan/tahun, breakdown per kategori, filter rentang tanggal (bulan ini / tahun ini / semua)
- **Charts**: Pie chart kategori + bar chart tren pengeluaran 6 bulan terakhir
- **Link ke modul lain**: Transaction bisa terlink ke bike, component, event, activity

### Kategori Transaction

| Kategori      | Contoh                                    |
| ------------- | ----------------------------------------- |
| `gear`        | Beli sepeda baru, komponen, helm, apparel |
| `maintenance` | Servis di shop, beli spare part, tool     |
| `event`       | Registration fee event, travel ke event   |
| `nutrition`   | Gel, drink, makan sebelum/sesudah ride    |
| `other`       | Lain-lain                                 |

### Integrasi dengan Modul Lain

- ⬅️ **Maintenance**: Maintenance log dengan cost → bisa auto-create transaction
- ⬅️ **Events**: Registration fee → bisa auto-create transaction
- ➡️ **Dashboard**: Budget summary tampil di dashboard

### Endpoint API

```
GET    /api/finance/transactions          # List dengan filter (date, category, type)
POST   /api/finance/transactions          # Tambah transaction
PATCH  /api/finance/transactions/:id      # Update
DELETE /api/finance/transactions/:id      # Hapus

GET    /api/finance/budgets               # List budget
POST   /api/finance/budgets               # Tambah budget
PATCH  /api/finance/budgets/:id           # Update
DELETE /api/finance/budgets/:id           # Hapus

GET    /api/finance/summary               # Summary per periode
GET    /api/finance/budget-status         # Budget vs actual per kategori
```

---

## Modul 5: Goals & Training (Phase 2)

### Fungsi

Target & progres training dengan analisis performa.

### Fitur

- **Goal types**: Distance (km), time (hours), elevation (m), activities count
- **Period**: Weekly, monthly, yearly, custom date range
- **Auto-progress**: `current_value` terupdate otomatis dari aktivitas yang sync
- **Progress ring**: Visual circular progress indicator
- **Status**: active, completed, failed, cancelled
- **Analytics**: Tren pencapaian goal dari waktu ke waktu

### Logika Auto-progress

Saat aktivitas baru di-sync:

```
Untuk setiap goal aktif yang periode-nya mencakup start_date aktivitas:
  - Jika type=distance: current_value += activity.distance / 1000
  - Jika type=time: current_value += activity.moving_time / 3600
  - Jika type=elevation: current_value += activity.total_elevation_gain
  - Jika type=activities_count: current_value += 1

  Jika current_value >= target_value:
    status = 'completed'
```

### Endpoint API

```
GET    /api/goals                 # List goal dengan filter status
POST   /api/goals                 # Tambah goal
PUT    /api/goals/:id             # Update goal
DELETE /api/goals/:id             # Hapus goal
GET    /api/goals/:id/status      # Status & progress detail
```

---

## Modul 6: Events (Phase 2)

### Fungsi

Manajemen event sepeda yang diikuti/direncanakan.

### Fitur

- **Event types**: Race, gran fondo, charity, group ride, tour, other
- **Calendar view**: Kalender event upcoming
- **Status**: registered, completed, cancelled, DNS (did not start), DNF (did not finish)
- **Result**: Catat hasil (finishing time, position, dll)
- **Link ke activity**: Event yang completed bisa di-link ke aktivitas Strava
- **Link ke bike**: Sepeda yang dipakai di event
- **Registration fee**: Biaya registrasi (terlink ke Finance)

### Endpoint API

```
GET    /api/events                # List event dengan filter
POST   /api/events                # Tambah event
GET    /api/events/:id            # Detail event
PUT    /api/events/:id            # Update event
DELETE /api/events/:id            # Hapus event
GET    /api/events/upcoming       # Event upcoming (sort by date)
```

---

## Modul 7: Dashboard ERP

### Fungsi

Overview seluruh modul dalam satu dashboard dengan KPI multi-modul, alerts, dan summaries.

### Komponen Dashboard

#### KPI Cards (atas)

| Card                 | Data Source            | Contoh             |
| -------------------- | ---------------------- | ------------------ |
| Total KM (bulan ini) | activities             | 320 km             |
| Total Activities     | activities             | 12 rides           |
| Active Bikes         | bikes                  | 2                  |
| Budget Used          | transactions + budgets | Rp 2.3M / 3M (77%) |

#### Alert Section (kiri tengah)

- **Maintenance Due**: List komponen/schedule yang due
- **Upcoming Events**: Event dalam 30 hari ke depan

#### Chart Section (kanan tengah)

- **Weekly Distance**: Bar chart jarak per minggu (4-8 minggu terakhir)
- **Goal Progress**: Progress ring goal aktif bulan ini

#### Recent Activity (kiri bawah)

- 5 aktivitas terbaru dengan jarak, waktu, tanggal

#### Recent Transactions (kanan bawah)

- 5 transaksi terbaru dengan amount & kategori

### Data Fetching

Dashboard meng-aggregate data dari multiple endpoint:

```
GET /api/activities/stats?period=month
GET /api/maintenance/due
GET /api/events/upcoming
GET /api/finance/budget-status
GET /api/goals?status=active
GET /api/activities?limit=5
GET /api/transactions?limit=5
```

React Query akan parallel-fetch semua ini dengan `useQueries` atau multiple `useQuery`.

---

## Integrasi Antar Modul — Summary Matrix

| From ↓ \ To →   | Activity            | Inventory         | Maintenance    | Finance                    | Goals                   | Events |
| --------------- | ------------------- | ----------------- | -------------- | -------------------------- | ----------------------- | ------ |
| **Activity**    | —                   | ✅ Auto update km | —              | —                          | ✅ Auto update progress | —      |
| **Inventory**   | —                   | —                 | ✅ Trigger due | —                          | —                       | —      |
| **Maintenance** | —                   | —                 | —              | ✅ Auto-create transaction | —                       | —      |
| **Finance**     | —                   | —                 | —              | —                          | —                       | —      |
| **Goals**       | —                   | —                 | —              | —                          | —                       | —      |
| **Events**      | ✅ Link to activity | ✅ Link to bike   | —              | ✅ Auto-create transaction | —                       | —      |

**✅ Auto** = otomatis terjadi (trigger/use case)
**Link** = relasi manual saat input

---

## Alur Otomatisasi Lengkap

### Saat Sync Strava Dijalankan

```
1. Fetch aktivitas dari Strava (type=Ride)
2. Untuk setiap aktivitas baru:
   ├─ Insert ke activities table
   ├─ IF bike_id IS NOT NULL:
   │   ├─ Update bikes.current_km += distance
   │   └─ Update components.current_km (semua komponen aktif)
   ├─ Update goals.current_value (goal aktif yang periode-nya cocok)
   └─ Cek maintenance_schedules (next_due_km)
3. Return summary sync
```

### Saat Maintenance Dilog

```
1. Insert ke maintenance_logs
2. IF cost > 0:
   └─ Auto-create transaction (category=maintenance, type=expense)
3. Update maintenance_schedules:
   ├─ last_performed_date = service_date
   ├─ last_performed_km = service_km
   ├─ next_due_km = service_km + interval_km
   └─ next_due_date = service_date + interval_days
4. IF type=replacement:
   ├─ Update component.status = 'replaced'
   └─ Create new component (install_km = service_km)
```

### Saat Event Completed

```
1. Update events.status = 'completed'
2. IF registration_fee > 0 AND belum ada transaction:
   └─ Auto-create transaction (category=event, type=expense)
3. IF link to activity:
   └─ Copy result dari aktivitas
```
