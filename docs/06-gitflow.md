# 06 — GitFlow

Workflow Git terstruktur menggunakan **Full GitFlow** dengan automation penuh (Husky, lint-staged, commitlint, standard-version) dan CI/CD via GitHub Actions.

---

## Branch Strategy

```
main ───────────────────────────────●──────────────────── (production)
 \                                    ↑ tag v1.0.0
  \                                  /
   develop ──────●────────●────────● (integration)
    \            ↑        ↑
     \           /        |
      feature/a ─┘        |
                          |
     feature/b ───────────┘

hotfix/* ──→ main + develop (darurat)
release/* ──→ main (dengan tag) + develop
```

### Aturan Branch

| Branch | Dari | Merge Ke | Kapan Dipakai |
|---|---|---|---|
| `main` | — | — | Production. Hanya dari `release/*` atau `hotfix/*` |
| `develop` | `main` | `main` (via release) | Branch utama development |
| `feature/<scope>-<desc>` | `develop` | `develop` | Fitur baru |
| `bugfix/<scope>-<desc>` | `develop` | `develop` | Perbaikan bug non-kritis |
| `hotfix/<scope>-<desc>` | `main` | `main` + `develop` | Perbaikan darurat production |
| `release/v<versi>` | `develop` | `main` + tag | Persiapan rilis |

---

## Naming Convention

### Branch
```
<type>/<scope>-<deskripsi-singkat>

type:    feature | bugfix | hotfix | release
scope:   client | server | db | docs | config | deps

Contoh:
feature/server-strava-oauth
feature/client-dashboard
feature/db-schema-mvp
bugfix/client-map-polyline
hotfix/server-token-refresh
release/v1.0.0
```

---

## Conventional Commits

Format:
```
<type>(<scope>): <deskripsi>

[optional body]

[optional footer(s)]
```

### Type

| Type | Kapan | Contoh |
|---|---|---|
| `feat` | Fitur baru | `feat(server): implement Strava OAuth callback` |
| `fix` | Bug fix | `fix(client): resolve map polyline decode error` |
| `docs` | Dokumentasi | `docs: add setup guide for Strava` |
| `style` | Formatting, no logic change | `style(client): format dashboard components` |
| `refactor` | Refactoring tanpa perubahan perilaku | `refactor(server): extract token refresh logic` |
| `perf` | Performance improvement | `perf(server): add database index for activities` |
| `test` | Tambahan/perubahan test | `test(server): add unit tests for bike repository` |
| `chore` | Maintenance, deps, config | `chore(deps): upgrade recharts to v3.10.1` |
| `ci` | CI/CD pipeline | `ci: add GitHub Actions workflow for build` |
| `build` | Build system / dependencies | `build: update vite config for production` |

### Scope (per modul)

```
client/app              → setup root app
client/features/auth     → auth frontend
client/features/map      → map component
client/features/dashboard → dashboard UI
client/features/inventory → inventory UI
server/domain            → domain layer
server/application       → use cases
server/infra             → infrastructure
server/interfaces        → routes/controllers
db                       → migration SQL
docs                     → dokumentasi
config                   → root config
deps                     → dependency updates
```

### Contoh Commit

```bash
feat(server/domain): add Bike and Component entities

feat(server/application): add UpdateComponentKm use case

feat(client/features/map): add ActivityMap with Leaflet

feat(db): add bikes and components tables with RLS

fix(client/features/auth): handle expired JWT gracefully

chore(deps): upgrade recharts to v3.10.1

docs: add architecture documentation
```

---

## Tag & Versioning (SemVer)

```
v<MAJOR>.<MINOR>.<PATCH>

v1.0.0    ← Initial release (MVP)
v1.0.1    ← Bugfix
v1.1.0    ← Feature baru (backward compatible) — mis. modul Goals
v2.0.0    ← Breaking changes
```

Tag dibuat saat merge release branch ke `main`:
```bash
git tag -a v1.0.0 -m "Release v1.0.0: Cycling ERP MVP"
```

---

## Workflow per Fitur

### 1. Mulai Fitur Baru

```bash
git checkout develop
git pull origin develop
git checkout -b feature/server-strava-oauth
```

### 2. Selama Development — Commit Berkala

```bash
git add server/src/domain/entities/auth/User.ts
git commit -m "feat(server/domain): add User entity"

git add server/src/domain/repositories/auth/UserRepository.ts
git commit -m "feat(server/domain): add UserRepository interface"

git add server/src/infrastructure/strava/StravaOauthAdapter.ts
git commit -m "feat(server/infra): implement StravaOauthAdapter"
```

### 3. Sinkron dengan Develop (jika ada perubahan upstream)

```bash
git checkout develop
git pull origin develop
git checkout feature/server-strava-oauth
git rebase develop
# Resolve conflicts jika ada
git push --force-with-lease origin feature/server-strava-oauth
```

### 4. Selesai Fitur — Push & Buat PR

```bash
git push -u origin feature/server-strava-oauth
# Buat PR via GitHub: feature/server-strava-oauth → develop
# Set reviewer (jika ada)
# Tunggu CI pass
```

### 5. Review & Merge PR

- Code review via GitHub PR
- Pastikan CI pass (lint, type-check, build)
- **Squash & merge** (rekomendasi) atau **Rebase & merge**
- Delete branch setelah merge:
  ```bash
  git branch -d feature/server-strava-oauth
  git push origin --delete feature/server-strava-oauth
  ```

### 6. Release ke Production

```bash
# Buat release branch dari develop
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0

# Final testing, bump version, update changelog
npm run release

# Merge ke main
git checkout main
git pull origin main
git merge --no-ff release/v1.0.0
git push origin main
git push origin --tags

# Merge release juga ke develop
git checkout develop
git merge release/v1.0.0
git push origin develop

# Hapus release branch
git branch -d release/v1.0.0
git push origin --delete release/v1.0.0
```

---

## Automation Setup

### Husky Git Hooks

| Hook | Script | Fungsi |
|---|---|---|
| `pre-commit` | `npx lint-staged` | Lint file yang di-staged |
| `commit-msg` | `npx commitlint --edit $1` | Validasi format Conventional Commits |
| `pre-push` | `npm run type-check` | TypeScript type-check sebelum push |

### `lint-staged` config (`package.json`)

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

### `commitlint` config (`commitlint.config.js`)

```js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'ci', 'build'],
    ],
    'subject-case': [0],
  },
}
```

### `standard-version` (auto changelog + version bump)

```json
{
  "scripts": {
    "release": "standard-version",
    "release:dry": "standard-version --dry-run",
    "release:minor": "standard-version --release-as minor",
    "release:major": "standard-version --release-as major"
  }
}
```

File yang di-generate:
- `CHANGELOG.md` — auto-generated dari Conventional Commits
- `package.json` — version bump otomatis

---

## GitHub Actions CI/CD

### `.github/workflows/ci.yml` — CI (saat PR ke develop/main)

```yaml
name: CI

on:
  pull_request:
    branches: [develop, main]
  push:
    branches: [develop]

jobs:
  lint-and-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run build:client
      - run: npm run build:server
```

### `.github/workflows/deploy.yml` — Deploy (saat push ke main)

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
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prod'
          working-directory: ./client

  deploy-server:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: bervProject/railway-deploy@v3
        with:
          service: ${{ secrets.RAILWAY_SERVICE }}
          token: ${{ secrets.RAILWAY_TOKEN }}
```

---

## Setup Husky (saat inisialisasi project)

```bash
# Install
npm install -D husky lint-staged @commitlint/cli @commitlint/config-conventional standard-version

# Init husky
npx husky init

# Buat hooks
echo "npx lint-staged" > .husky/pre-commit
echo "npx commitlint --edit \$1" > .husky/commit-msg
echo "npm run type-check" > .husky/pre-push
```
