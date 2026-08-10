# 07 — Setup Guide

Panduan step-by-step untuk menyiapkan environment development: Strava Developer, Supabase, install dependencies, dan run project secara lokal.

---

## Prasyarat

| Tool | Versi | Cara Cek |
|---|---|---|
| **Node.js** | 22+ (wajib, untuk Vite 8) | `node --version` |
| **npm** | 10+ | `npm --version` |
| **Git** | 2.40+ | `git --version` |
| **VS Code** (opsional) | terbaru | — |

### VS Code Extensions (rekomendasi)
- ESLint
- Prettier - Code formatter
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar) — untuk TS support
- Console Ninja — untuk logging

---

## 1. Setup Strava Developer Account

Strava API gratis untuk penggunaan pribadi (limit: 200 req/15 menit, 1000 req/hari).

### Step-by-step

1. **Login ke Strava**
   - Buka https://www.strava.com
   - Login dengan akun Strava Anda (daftar dulu jika belum punya)

2. **Buka Strava API Settings**
   - Kunjungi https://www.strava.com/settings/api
   - Atau: Hover avatar (kanan atas) → Settings → My API Application

3. **Buat Aplikasi Baru**
   - Isi form:
     - **Application Name**: `Cycling ERP` (atau nama bebas)
     - **Category**: `Visualizer` (atau lainnya)
     - **Club**: (kosongkan)
     - **Client Authorization Callback Domain**: `localhost`
       - Untuk production nanti: domain Vercel Anda (mis. `cycling-erp.vercel.app`)
     - **Website**: `http://localhost:5173`
   - Centang agreement
   - Klik **Create**

4. **Dapatkan Credentials**
   - Setelah aplikasi dibuat, Anda akan melihat:
     - **Client ID**: angka (mis. `12345`)
     - **Client Secret**: string (mis. `abc123def456...`)
   - Simpan kedua nilai ini — akan dipakai di `.env`

5. **Catat Redirect URI**
   - Callback domain: `localhost`
   - Redirect URI lengkap: `http://localhost:3001/api/auth/callback`
   - Pastikan ini cocok dengan `STRAVA_REDIRECT_URI` di server `.env`

### OAuth Scopes yang Dibutuhkan

Aplikasi akan meminta scopes berikut saat user login:
- `read` — baca profil
- `activity:read_all` — baca semua aktivitas
- `profile:read_all` — baca profil lengkap

URL authorization:
```
https://www.strava.com/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code&scope=read,activity:read_all,profile:read_all&approval_prompt=auto
```

---

## 2. Setup Supabase Project

Supabase free tier: 500MB database, 50K MAU, cukup untuk aplikasi pribadi.

### Step-by-step

1. **Daftar/Login ke Supabase**
   - Buka https://supabase.com
   - Daftar dengan GitHub atau email
   - Login ke dashboard

2. **Buat Project Baru**
   - Klik **New Project**
   - Isi:
     - **Name**: `cycling-erp` (atau nama bebas)
     - **Database Password**: buat password kuat, **simpan baik-baik**
     - **Region**: pilih terdekat (mis. `Southeast Asia (Singapore)`)
     - **Pricing Plan**: Free
   - Klik **Create new project**
   - Tunggu ±2 menit hingga project siap

3. **Dapatkan API Keys**
   - Di dashboard: Settings (gear icon kiri bawah) → API
   - Catat:
     - **Project URL**: `https://xxxxxxxx.supabase.co`
     - **anon public key**: untuk client (tidak dipakai di project ini, BE pakai service_role)
     - **service_role secret key**: untuk backend (jaga kerahasiaan!)

4. **Jalankan Migration SQL**
   - Di dashboard: SQL Editor (ikon kiri)
   - Klik **New query**
   - Copy-paste isi setiap file migration dari `supabase/migrations/` secara berurutan:
     - `001_create_users_and_profiles.sql`
     - `002_create_bikes_and_components.sql`
     - `003_create_activities.sql`
     - `004_create_maintenance_tables.sql`
     - `005_create_finance_tables.sql`
     - `006_create_goals.sql`
     - `007_create_events.sql`
     - `008_add_foreign_keys.sql`
     - `009_enable_rls_and_policies.sql`
     - `010_create_triggers.sql`
   - Atau gabungkan semua jadi satu file dan jalankan sekaligus
   - Klik **Run** untuk eksekusi

5. **Verifikasi Tabel**
   - Di dashboard: Table Editor (ikon kiri)
   - Pastikan 13 tabel sudah terbuat:
     - `users`, `user_profiles`
     - `activities`
     - `bikes`, `components`
     - `maintenance_logs`, `maintenance_schedules`
     - `transactions`, `budgets`
     - `goals`
     - `events`

---

## 3. Clone & Install Project

```bash
# Clone repository
git clone <repo-url>
cd tracking-sepeda

# Install root dependencies (tooling: husky, commitlint, dll)
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install

# Kembali ke root
cd ..
```

---

## 4. Setup Environment Variables

### Server (`server/.env`)

Copy template:
```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
# Server
PORT=3001
NODE_ENV=development

# Strava (dari step 1)
STRAVA_CLIENT_ID=your_client_id_here
STRAVA_CLIENT_SECRET=your_client_secret_here
STRAVA_REDIRECT_URI=http://localhost:3001/api/auth/callback

# Supabase (dari step 2)
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# JWT
JWT_SECRET=generate_random_string_min_32_chars
JWT_EXPIRES_IN=7d

# Client URL (untuk CORS)
CLIENT_URL=http://localhost:5173
```

**Generate JWT_SECRET**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Client (`client/.env`)

Copy template:
```bash
cp client/.env.example client/.env
```

Edit `client/.env`:
```env
VITE_API_URL=http://localhost:3001
```

---

## 5. Run Development Server

Buka **dua terminal**:

### Terminal 1 — Backend

```bash
cd server
npm run dev
```

Expected output:
```
[tsx] Running in dev mode
Server running on http://localhost:3001
```

### Terminal 2 — Frontend

```bash
cd client
npm run dev
```

Expected output:
```
  VITE v8.2.1  ready in 342 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Buka http://localhost:5173 di browser.

---

## 6. Verifikasi Setup

### Test Strava OAuth

1. Buka http://localhost:5173 → akan redirect ke login page
2. Klik **"Login with Strava"**
3. Redirect ke Strava consent screen
4. Authorize aplikasi
5. Redirect kembali ke `http://localhost:3001/api/auth/callback`
6. Backend set JWT cookie → redirect ke dashboard
7. Jika dashboard tampil, setup berhasil!

### Test Sync Aktivitas

1. Di dashboard, klik **"Sync Now"**
2. Backend akan fetch aktivitas dari Strava
3. Aktivitas muncul di list
4. Cek di Supabase Table Editor → tabel `activities` sudah terisi

---

## 7. Scripts yang Tersedia

### Root (`package.json`)

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:client": "cd client && npm run dev",
    "dev:server": "cd server && npm run dev",
    "lint": "npm run lint:client && npm run lint:server",
    "lint:client": "cd client && npm run lint",
    "lint:server": "cd server && npm run lint",
    "type-check": "npm run type-check:client && npm run type-check:server",
    "type-check:client": "cd client && tsc --noEmit",
    "type-check:server": "cd server && tsc --noEmit",
    "build": "npm run build:client && npm run build:server",
    "build:client": "cd client && npm run build",
    "build:server": "cd server && npm run build",
    "release": "standard-version",
    "release:dry": "standard-version --dry-run",
    "prepare": "husky"
  }
}
```

### Client (`client/package.json`)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx"
  }
}
```

### Server (`server/package.json`)

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint src --ext .ts"
  }
}
```

---

## Troubleshooting

### Port sudah digunakan

```bash
# Cek apa yang pakai port 3001 atau 5173
# Windows:
netstat -ano | findstr :3001
# Kill process:
taskkill /PID <PID> /F
```

### Strava OAuth error: "Bad Request"

- Pastikan `STRAVA_REDIRECT_URI` di `.env` cocok persis dengan Callback Domain di Strava settings
- Callback domain di Strava: `localhost` (tanpa http/https)
- Redirect URI lengkap: `http://localhost:3001/api/auth/callback`

### Supabase connection error

- Pastikan `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` benar
- Cek region project (harus sesuai dengan URL)
- Service role key punya akses bypass RLS — pastikan tidak leaked

### CORS error di browser

- Pastikan `CLIENT_URL` di server `.env` = `http://localhost:5173`
- Backend harus set `credentials: true` di CORS config
- Axios di client harus set `withCredentials: true`

### Tailwind styles tidak muncul

- Pastikan `@import "tailwindcss";` ada di `src/index.css`
- Pastikan `@tailwindcss/vite` plugin terpasang di `vite.config.ts`
- Restart dev server setelah install Tailwind

### TypeScript errors

- Pastikan Node 22+ (cek: `node --version`)
- Run `npm run type-check` untuk lihat error detail
- Pastikan `tsconfig.json` sesuai (lihat [Tech Stack doc](./02-tech-stack.md))

---

## Next Steps

Setelah setup berhasil:
1. Baca [Architecture](./03-architecture.md) untuk memahami struktur code
2. Baca [Modules](./05-modules.md) untuk detail fitur per modul
3. Baca [Implementation Phases](./09-implementation-phases.md) untuk roadmap development
4. Mulai dari **Fase 0: GitFlow & Automation Setup** di implementation phases
