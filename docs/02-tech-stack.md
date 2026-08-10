# 02 — Tech Stack

> Semua versi sudah diverifikasi kompatibilitasnya (peer dependencies) dan dikunci untuk konsistensi.

---

## Frontend (`client/`)

| Package | Versi | Fungsi | Catatan |
|---|---|---|---|
| `react` | 19.2.8 | UI library | Versi terbaru, support dari semua library utama |
| `react-dom` | 19.2.8 | React DOM renderer | — |
| `vite` | 8.2.1 | Build tool & dev server | **Butuh Node 22+** |
| `@vitejs/plugin-react` | 6.0.5 | React plugin untuk Vite | Kompatibel Vite 8 |
| `typescript` | 7.0.2 | Type system | Versi terbaru |
| `tailwindcss` | 4.3.3 | CSS framework | **Setup berbeda v3** — via `@tailwindcss/vite`, tanpa config files |
| `@tailwindcss/vite` | 4.3.3 | Vite plugin untuk Tailwind v4 | — |
| `react-router-dom` | 7.18.2 | Routing | Support React 19, SPA mode |
| `@tanstack/react-query` | 5.101.4 | Data fetching & caching | Server state management |
| `axios` | 1.19.0 | HTTP client | Interceptors untuk auth |
| `recharts` | 3.10.1 | Grafik & chart | Support React 19 |
| `react-leaflet` | 5.0.0 | React wrapper Leaflet | Peer dep `react@^19` ✅ |
| `leaflet` | 1.9.4 | Map library | OpenStreetMap, gratis |
| `@mapbox/polyline` | 1.2.1 | Decode Strava polyline | — |
| `date-fns` | 4.4.0 | Date manipulation | — |

### Frontend Dev Dependencies

| Package | Versi | Fungsi |
|---|---|---|
| `@types/react` | 19.2.18 | Type definitions |
| `@types/react-dom` | 19.2.4 | Type definitions |
| `@types/leaflet` | 1.9.22 | Type definitions |
| `@types/mapbox__polyline` | terbaru | Type definitions |
| `eslint` | 9.0.3 | Linting |
| `prettier` | terbaru | Code formatting |
| `@typescript-eslint/parser` | terbaru | ESLint TS parser |
| `@typescript-eslint/eslint-plugin` | terbaru | ESLint TS rules |

---

## Backend (`server/`)

| Package | Versi | Fungsi | Catatan |
|---|---|---|---|
| `express` | 4.21.2 | Web framework | **v4 (stabil)**, bukan v5 yang ada breaking changes |
| `typescript` | 7.0.2 | Type system | — |
| `tsx` | 4.23.12 | TS runner untuk dev | Hot reload di development |
| `tsyringe` | 4.10.0 | Dependency Injection container | Clean Architecture wiring |
| `@supabase/supabase-js` | 2.112.2 | Supabase client | PostgreSQL access |
| `jsonwebtoken` | 9.0.3 | JWT generation/verification | Auth session |
| `cookie-parser` | 1.4.7 | Parse cookies | JWT di httpOnly cookie |
| `cors` | 2.8.6 | CORS middleware | FE ↔ BE communication |
| `dotenv` | 17.4.2 | Environment variables | — |
| `reflect-metadata` | 0.2.2 | Required by tsyringe | Decorator metadata |

### Backend Dev Dependencies

| Package | Versi | Fungsi |
|---|---|---|
| `@types/express` | 5.0.6 | Type definitions |
| `@types/jsonwebtoken` | terbaru | Type definitions |
| `@types/cookie-parser` | terbaru | Type definitions |
| `@types/cors` | terbaru | Type definitions |
| `@types/node` | 26.2.0 | Type definitions |
| `eslint` | 9.0.3 | Linting |
| `prettier` | terbaru | Code formatting |

---

## Root Tooling (Monorepo)

| Package | Versi | Fungsi |
|---|---|---|
| `husky` | terbaru | Git hooks |
| `lint-staged` | terbaru | Lint staged files |
| `@commitlint/cli` | terbaru | Commit message linting |
| `@commitlint/config-conventional` | terbaru | Conventional Commits config |
| `standard-version` | terbaru | Auto changelog + version bump |
| `eslint` | 9.0.3 | Linting (shared config) |
| `prettier` | terbaru | Code formatting (shared config) |

---

## External Services

| Service | Tier | Fungsi | Catatan |
|---|---|---|---|
| **Supabase** | Free | PostgreSQL database | 500MB DB, 50K MAU — cukup untuk pribadi |
| **Strava API** | Free | Data aktivitas sepeda | Limit: 200 req/15min, 1000 req/hari |
| **Vercel** | Free | Frontend deployment | Auto-deploy dari GitHub |
| **Railway/Render** | Free tier | Backend deployment | Render free sleep setelah 15min idle |
| **OpenStreetMap** | Free | Map tiles untuk Leaflet | Tidak perlu API key |

---

## Kompatibilitas yang Diverifikasi

| Kombinasi | Status | Catatan |
|---|---|---|
| React 19 + react-leaflet 5 | ✅ | peer dep `react@^19` |
| React 19 + recharts 3 | ✅ | Support React 19 |
| React 19 + react-router-dom 7 | ✅ | Support React 19 |
| Vite 8 + @vitejs/plugin-react 6 | ✅ | Kompatibel |
| Tailwind v4 + Vite | ✅ | Via `@tailwindcss/vite` plugin |
| Express 4 + TypeScript 7 | ✅ | Stabil |
| tsyringe 4 + TypeScript 7 | ✅ | Butuh `reflect-metadata` |

---

## Catatan Penting Setup

### Tailwind v4 (Breaking Change dari v3)

**Tidak perlu** `tailwind.config.js`, `postcss.config.js`, atau `autoprefixer`.

Setup cukup 3 langkah:

1. **`vite.config.ts`**:
   ```ts
   import tailwindcss from '@tailwindcss/vite'
   export default defineConfig({
     plugins: [react(), tailwindcss()],
   })
   ```

2. **`src/index.css`**:
   ```css
   @import "tailwindcss";

   @theme {
     --color-primary: #16a34a;
     --color-primary-dark: #15803d;
   }
   ```

3. **Selesai.** Tidak ada config file lain.

### Vite 8 — Node 22+ Required

Pastikan Node.js versi 22+ terinstall. Tambahkan di `package.json`:
```json
{
  "engines": {
    "node": ">=22.0.0"
  }
}
```

### TypeScript 7 — tsconfig

Gunakan target & moduleResolution ESNext:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true
  }
}
```
