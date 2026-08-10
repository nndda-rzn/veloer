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

- **Fase saat ini**: 0 — GitFlow & Automation Setup
- **Strategi**: Bertahap (phased) — Phase 1 (MVP: Modul 1-4 + Dashboard), Phase 2 (Modul 5-7)
- **Target MVP**: v1.0.0 (Modul Activity, Inventory, Maintenance, Finance, Dashboard)

---

## Quick Start

> Panduan lengkap ada di [Setup Guide](./docs/07-setup-guide.md)

```bash
# Clone repo
git clone https://github.com/nndda-rzn/veloer.git
cd veloer

# Install dependencies (root, client, server)
npm install
cd client && npm install
cd ../server && npm install

# Setup environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env
# Edit .env files sesuai panduan setup

# Run development
# Terminal 1 (server):
cd server && npm run dev

# Terminal 2 (client):
cd client && npm run dev
```

---

## Tech Stack Singkat

- **Frontend**: React 19 + Vite 8 + TypeScript 7 + Tailwind v4
- **Backend**: Express 4 + TypeScript 7 + tsyringe (Clean Architecture)
- **Database**: Supabase (PostgreSQL)
- **Integrasi**: Strava API v3
- **Deployment**: Vercel (FE) + Railway/Render (BE)

Detail versi package ada di [Tech Stack](./docs/02-tech-stack.md).
