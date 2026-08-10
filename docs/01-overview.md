# 01 — Overview

## Visi

Membangun **mini ERP pribadi** untuk mengelola seluruh aspek hobi bersepeda dalam satu sistem terintegrasi. Bukan sekadar tracking jarak, tapi mencakup inventaris, maintenance, keuangan, goals, dan events — dengan data yang saling terhubung.

## Tujuan

- **Single source of truth** untuk semua data terkait sepeda
- **Otomatisasi** alur data antar modul (aktivitas → update km sepeda → update wear komponen → trigger maintenance alert)
- **Visibilitas** penuh atas pengeluaran, kondisi gear, dan progres training
- **Pribadi** (single user) — tidak ada multi-tenant, fokus pada pengalaman satu pengguna

---

## Konsep Mini ERP

Yang membedakan ERP dari kumpulan aplikasi terpisah adalah **integrasi data**. Setiap modul tidak berdiri sendiri, melainkan terhubung melalui relasi yang jelas:

```
Strava Sync ─→ Activity ─→ Bike (update km)
                   │            └─→ Component (update wear)
                   │                  └─→ Maintenance (trigger alert)
                   │                        └─→ Finance (log cost)
                   │
                   ├─→ Goals (update progress)
                   └─→ Events (record result)
```

### Contoh Alur Terintegrasi

1. **Sync Strava**: Aktivitas 50km baru masuk menggunakan sepeda "Giant TCR"
2. **Update Inventory**: `bikes.current_km` Giant TCR bertambah 50km
3. **Update Component**: `components.current_km` rantai, ban, dll bertambah 50km
4. **Cek Maintenance**: Sistem cek `maintenance_schedules` — rantai sudah mendekati `expected_lifespan_km` → trigger alert
5. **Update Goals**: Goal bulanan "500km" terupdate progresnya
6. **Dashboard**: KPI cards, alert maintenance, dan goal progress semuanya terupdate

---

## 7 Modul ERP

### MVP (Phase 1)

| # | Modul | Fungsi Utama |
|---|---|---|
| 1 | **Activity Tracking** | Sync aktivitas dari Strava, statistik, peta rute interaktif, riwayat |
| 2 | **Bike & Gear Inventory** | Multi-sepeda, komponen (rantai, ban, dll), umur pakai berbasis jarak, status |
| 3 | **Maintenance Log** | Service log, reminder berbasis jarak/waktu, prediksi penggantian komponen |
| 4 | **Finance Tracker** | Pengeluaran (IDR), kategori (gear/maintenance/event), budget bulanan, laporan |
| 7 | **Dashboard ERP** | Overview KPI multi-modul, alert maintenance, summary keuangan, recent activities |

### Phase 2

| # | Modul | Fungsi Utama |
|---|---|---|
| 5 | **Goals & Training** | Target jarak/bulan, target event, progres training, analisis performa |
| 6 | **Events** | Kalender event sepeda (race, gran fondo, group ride), persiapan, hasil |

---

## Skala Penggunaan

- **Single user** (pribadi) — satu akun, satu set data
- **Multi-bike** — dukung multiple sepeda (road, MTB, gravel, dll)
- **Tidak ada registrasi publik** — login via Strava OAuth, satu akun Strava terhubung
- **Mata uang**: IDR (Rupiah) untuk semua transaksi finance

---

## Integrasi Strava

Strava berperan sebagai **sumber data otomatis** untuk modul Activity, dan terhubung ke modul Inventory:

| Modul | Koneksi Strava |
|---|---|
| Activity Tracking | Sync penuh — ambil semua aktivitas tipe `Ride` dari Strava |
| Bike & Gear Inventory | Auto-update `current_km` sepeda & komponen saat aktivitas sync |
| Maintenance Log | Tidak langsung — trigger dari Inventory wear tracking |
| Finance Tracker | Manual — user input pengeluaran |
| Goals & Training | Auto-update progres dari aktivitas yang tersync |
| Events | Manual — user input event, bisa link ke aktivitas |

---

## Prinsip Desain

1. **Clean Architecture** di backend — pemisahan domain/application/infrastructure/interfaces
2. **Feature-based** di frontend — granular per modul, mudah maintain
3. **Type-safe** — TypeScript strict mode, type sharing antara client & server
4. **Offline-capable mindset** — data di-cache (React Query), graceful degradation
5. **Mobile-first responsive** — bisa dipakai di HP saat di lapangan
6. **GitFlow terstruktur** — conventional commits, automation, CI/CD
