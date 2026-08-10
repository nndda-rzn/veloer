# 08 — Deployment

Panduan deployment: Frontend ke Vercel, Backend ke Railway/Render, dan konfigurasi environment variables di production.

---

## Arsitektur Deployment

```
                        ┌─────────────────┐
                        │   GitHub Repo   │
                        └────────┬────────┘
                                 │
                    push ke main │
                                 │
              ┌──────────────────┴──────────────────┐
              │                                     │
              ▼                                     ▼
    ┌─────────────────┐                   ┌─────────────────┐
    │     Vercel      │                   │  Railway/Render │
    │  (Frontend)     │                   │   (Backend)     │
    │  React + Vite   │                   │  Express API    │
    └────────┬────────┘                   └────────┬────────┘
             │                                     │
             │           ┌─────────────┐           │
             └──────────→│  Supabase   │←──────────┘
                         │ PostgreSQL  │
                         └─────────────┘
```

---

## 1. Deploy Frontend ke Vercel

Vercel adalah platform terbaik untuk React + Vite, auto-deploy dari GitHub.

### Step-by-step

1. **Push code ke GitHub**
   ```bash
   git push origin main
   ```

2. **Login ke Vercel**
   - Buka https://vercel.com
   - Login dengan GitHub

3. **Import Project**
   - Klik **Add New** → **Project**
   - Pilih repository `tracking-sepeda`
   - **Root Directory**: `client` (penting!)
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build` (otomatis terdeteksi)
   - **Output Directory**: `dist` (otomatis terdeteksi)
   - **Install Command**: `npm install` (otomatis terdeteksi)

4. **Set Environment Variables**
   - Di Vercel dashboard → Settings → Environment Variables
   - Tambah:
     ```
     VITE_API_URL = https://your-backend-url.railway.app
     ```
   - (URL backend dari step 2, setelah backend di-deploy)

5. **Deploy**
   - Klik **Deploy**
   - Tunggu build selesai
   - Dapat URL: `https://tracking-sepeda.vercel.app` (atau random)

6. **Update Strava Callback Domain**
   - Kembali ke https://www.strava.com/settings/api
   - Tambah domain Vercel ke **Client Authorization Callback Domain**:
     - `tracking-sepeda.vercel.app`
   - (Tanpa http/https, hanya domain)

### Custom Domain (opsional)

- Vercel Dashboard → Domains → Add domain
- Ikuti instruksi DNS setup
- Update Strava callback domain jika pakai custom domain

---

## 2. Deploy Backend ke Railway

Railway recommended untuk Express app yang butuh persistent server.

### Step-by-step

1. **Login ke Railway**
   - Buka https://railway.app
   - Login dengan GitHub

2. **New Project**
   - Klik **New Project** → **Deploy from GitHub repo**
   - Pilih repository `tracking-sepeda`
   - **Root Directory**: `server` (penting!)

3. **Set Environment Variables**
   - Di Railway dashboard → Variables tab
   - Tambah semua env vars dari `server/.env`:
     ```
     PORT=3001
     NODE_ENV=production
     STRAVA_CLIENT_ID=your_client_id
     STRAVA_CLIENT_SECRET=your_client_secret
     STRAVA_REDIRECT_URI=https://your-backend-url.railway.app/api/auth/callback
     SUPABASE_URL=https://xxxxxxxx.supabase.co
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
     JWT_SECRET=your_jwt_secret
     JWT_EXPIRES_IN=7d
     CLIENT_URL=https://your-frontend-url.vercel.app
     ```

4. **Configure Build & Start Commands**
   - Railway biasanya auto-detect dari `package.json`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - Pastikan `server/package.json` punya script start:
     ```json
     {
       "scripts": {
         "build": "tsc",
         "start": "node dist/index.js"
       }
     }
     ```

5. **Generate Domain**
   - Railway dashboard → Settings → Networking
   - Klik **Generate Domain**
   - Dapat URL: `https://tracking-sepeda-production.up.railway.app`

6. **Update Environment Variables (circular dependency)**
   - Setelah dapat backend URL, update:
     - `STRAVA_REDIRECT_URI` di Railway → `https://your-backend-url.railway.app/api/auth/callback`
     - `CLIENT_URL` di Railway → URL Vercel Anda
     - `VITE_API_URL` di Vercel → URL Railway Anda
   - Redeploy kedua aplikasi

### Alternatif: Render

Jika pakai Render (free tier, tapi sleep setelah 15 min idle):

1. Buka https://render.com → New → **Web Service**
2. Connect GitHub repo
3. **Root Directory**: `server`
4. **Build Command**: `npm install && npm run build`
5. **Start Command**: `npm start`
6. Set env vars sama seperti Railway
7. Dapat URL: `https://tracking-sepeda.onrender.com`

---

## 3. Deploy Backend ke Render (Alternatif)

> Lihat section di atas. Catatan: free tier Render sleep setelah 15 menit idle, request pertama setelah idle butuh ±30 detik untuk cold start.

---

## 4. Supabase Production Setup

Supabase project yang dipakai di development bisa langsung dipakai di production. Beberapa hal yang perlu di-config:

### Update Strava Callback Domain

1. Buka https://www.strava.com/settings/api
2. Di **Client Authorization Callback Domain**, tambahkan:
   - `localhost` (untuk dev)
   - `your-backend-url.railway.app` (untuk prod)
3. Multiple domain bisa dipisah dengan koma atau baris baru

### Database Backup (opsional untuk free tier)

- Supabase free tier tidak punya automated backup
- Lakukan manual backup berkala via SQL Editor → Download CSV
- Atau upgrade ke Pro tier ($25/bulan) untuk automated backup

---

## 5. Environment Variables Summary

### Frontend (Vercel)

| Var | Value | Contoh |
|---|---|---|
| `VITE_API_URL` | URL backend production | `https://tracking-sepeda-production.up.railway.app` |

### Backend (Railway/Render)

| Var | Value | Contoh |
|---|---|---|
| `PORT` | Port server | `3001` |
| `NODE_ENV` | Environment | `production` |
| `STRAVA_CLIENT_ID` | Dari Strava API settings | `12345` |
| `STRAVA_CLIENT_SECRET` | Dari Strava API settings | `abc123...` |
| `STRAVA_REDIRECT_URI` | Backend URL + `/api/auth/callback` | `https://your-backend.railway.app/api/auth/callback` |
| `SUPABASE_URL` | Dari Supabase dashboard | `https://xxxxxxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Dari Supabase dashboard | `eyJhbGci...` |
| `JWT_SECRET` | Random string 32+ chars | `a1b2c3d4...` |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `CLIENT_URL` | Frontend URL | `https://your-app.vercel.app` |

---

## 6. CI/CD Auto-Deploy (GitHub Actions)

Setelah Vercel & Railway terhubung ke GitHub repo, auto-deploy otomatis:

### Vercel
- Auto-deploy saat push ke `main` (production) dan `develop` (preview)
- Setiap PR otomatis dapat preview URL

### Railway
- Auto-deploy saat push ke `main`
- Bisa config di Railway dashboard → Settings → Deploy

### GitHub Actions Workflow

Lihat [GitFlow doc](./06-gitflow.md) untuk config CI/CD lengkap.

`.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-client:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prod'
          working-directory: ./client

  deploy-server:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@v3
        with:
          service: ${{ secrets.RAILWAY_SERVICE }}
          token: ${{ secrets.RAILWAY_TOKEN }}
```

### GitHub Secrets yang Dibutuhkan

Di GitHub repo → Settings → Secrets and variables → Actions:

| Secret | Value |
|---|---|
| `VERCEL_TOKEN` | Generate di Vercel Account Settings → Tokens |
| `RAILWAY_TOKEN` | Generate di Railway Account Settings → API Tokens |
| `RAILWAY_SERVICE` | Service ID dari Railway dashboard |

---

## 7. Post-Deployment Checklist

- [ ] Frontend accessible di Vercel URL
- [ ] Backend accessible di Railway/Render URL
- [ ] Strava OAuth flow works (login → callback → dashboard)
- [ ] Sync Strava activities works
- [ ] CORS configured properly (no errors di browser console)
- [ ] Database tables accessible (test via API)
- [ ] JWT cookie set properly (check di browser DevTools)
- [ ] Strava callback domain includes production domain
- [ ] Environment variables all set correctly
- [ ] GitHub Actions CI/CD runs on push to main

---

## 8. Monitoring & Maintenance

### Vercel Analytics (free)
- Vercel Dashboard → Analytics → Enable
- Lihat traffic, performance, audience

### Railway Metrics
- Railway dashboard → Metrics tab
- Monitor CPU, memory, response time

### Supabase Usage
- Supabase dashboard → Settings → Usage
- Monitor database size, API requests, storage

### Strava API Rate Limit
- Cek header response: `X-RateLimit-Limit` & `X-RateLimit-Usage`
- Limit: 200 req/15min, 1000 req/hari
- Jika mendekati limit, kurangi frekuensi sync

### Log Monitoring
- Vercel: Dashboard → Functions → Logs
- Railway: Dashboard → Logs tab
- Backend: tambah logger (winston/pino) untuk structured logging
