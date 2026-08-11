# 13 — Full UI/UX Redesign (v2.7.0)

Dokumentasi rencana redesign menyeluruh seluruh halaman Veloer.

**Gaya:** Minimal & data-dense (Vercel/Linear style)
**Sidebar:** Light sidebar dengan border tegas
**Font:** Inter via Google Fonts CDN
**Warna primary:** Hijau `#16a34a` (dipertahankan)

---

## Prinsip Design System

### Typography

- Font: Inter (Google Fonts CDN) — load di `index.html`
- Scale: `text-xs` (12px) metadata, `text-sm` (14px) body, `text-base` (16px) label penting, `text-xl`/`text-2xl` page title
- Heading: satu `<h1>` per halaman, sub-section `<h2>`, widget `<h3>`
- Weight: `font-medium` label, `font-semibold` section header, `font-bold` page title dan angka besar
- Color: `text-gray-900` primary, `text-gray-600` secondary, `text-gray-400` metadata

### Spacing

- Page padding: `p-6` desktop, `p-4` mobile
- Section gap: `space-y-6`
- Card padding: `p-4` compact, `p-5` standard, `p-6` forms
- Form field gap: `space-y-4`

### Cards

- Border: `border border-gray-200`
- Radius: `rounded-xl` (naik dari `rounded-lg`)
- Shadow: `shadow-sm` default, `shadow-md` hover
- Background: `bg-white`

### Buttons

- Primary: `bg-primary text-white hover:bg-primary-dark focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`
- Secondary: `border border-gray-300 text-gray-700 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-gray-400`
- Danger: `border border-red-300 text-red-600 hover:bg-red-50`
- Destructive: `bg-red-600 text-white hover:bg-red-700`
- Size standard: `px-4 py-2 text-sm`, compact: `px-3 py-1.5 text-xs`
- SEMUA button wajib punya `focus-visible:ring-2`

### Form Inputs

- Base: `w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400`
- Focus: `focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20`
- Error: `border-red-400 focus:border-red-400 focus:ring-red-400/20`
- Label: `block text-sm font-medium text-gray-700 mb-1`

### Sidebar (Light)

- Background: `bg-white`
- Border kanan: `border-r-2 border-gray-100` (lebih tegas)
- Header: `border-b-2 border-gray-100`
- Nav active: `border-l-[3px] border-primary bg-primary/8 text-primary font-semibold`
- Nav inactive: `text-gray-600 hover:bg-gray-50 hover:text-gray-900`
- Bottom: `border-t-2 border-gray-100`

### Status/Badge

- TIDAK ADA raw enum value — semua diformat
- `VirtualRide` → `Virtual Ride`, `planned` → `Planned`, `bike_parts` → `Bike Parts`
- Variant: success=green, warning=amber, danger=red, info=blue, neutral=gray
- Style: `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium`

### Empty States

- Icon (Lucide, 40px, `text-gray-300`)
- Title (`text-sm font-medium text-gray-900`)
- Description (`text-xs text-gray-500 mt-1`)
- CTA button (optional)

### Error/Alert Banners

- Error: `bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700`
- Success: `bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700`
- Warning: `bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700`
- SEMUA pakai Lucide icon, bukan emoji

### Aksesibilitas

- Semua icon-only button wajib `aria-label`
- Semua emoji wajib `aria-hidden="true"`
- Semua modal: `role="dialog"` + `aria-modal="true"`
- `focus-visible:ring-2` di semua interactive element
- Satu `<h1>` per halaman

---

## Shared Components Baru

### `PageHeader`

```
client/src/shared/components/ui/PageHeader.tsx
```

```tsx
interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}
```

Menggantikan pola `<div className="flex items-center justify-between">` yang berulang di semua halaman.

### `EmptyState`

```
client/src/shared/components/ui/EmptyState.tsx
```

```tsx
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}
```

### `Badge`

```
client/src/shared/components/ui/Badge.tsx
```

```tsx
interface BadgeProps {
  variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  children: ReactNode;
}
```

### `ConfirmDialog`

```
client/src/shared/components/ui/ConfirmDialog.tsx
```

```tsx
interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}
```

Menggantikan `confirm()` dan inline dialog markup berulang di semua halaman.

### Export semua dari:

```
client/src/shared/components/ui/index.ts
```

---

## Utility Functions Baru

### `formatActivityType(type: string): string`

Di `client/src/shared/lib/utils.ts`:

```ts
// 'VirtualRide' -> 'Virtual Ride'
// 'Ride' -> 'Ride'
// 'Run' -> 'Run'
export function formatActivityType(type: string): string {
  return type.replace(/([A-Z])/g, ' $1').trim();
}
```

### `formatEnumLabel(value: string): string`

```ts
// 'bike_parts' -> 'Bike Parts'
// 'planned' -> 'Planned'
export function formatEnumLabel(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
```

---

## Phase Breakdown

### Phase 1 — Foundation (PR #84)

**Branch:** `feat/ui-foundation`
**Files:**

- `client/index.html` — tambah Inter Google Fonts `<link>`
- `client/src/index.css` — tambah global `focus-visible` ring
- `client/src/shared/lib/utils.ts` — tambah `formatActivityType`, `formatEnumLabel`
- `client/src/shared/components/ui/PageHeader.tsx` — NEW
- `client/src/shared/components/ui/EmptyState.tsx` — NEW
- `client/src/shared/components/ui/Badge.tsx` — NEW
- `client/src/shared/components/ui/ConfirmDialog.tsx` — NEW
- `client/src/shared/components/ui/index.ts` — NEW

**Scope:**

- Load Inter 400/500/600/700 dari Google Fonts
- Global `focus-visible:ring-2` di `index.css`
- Buat 4 shared components
- Utility functions

---

### Phase 2 — Layout & Sidebar (PR #85)

**Branch:** `feat/ui-layout`
**Files:**

- `client/src/shared/components/layout/Layout.tsx`

**Scope:**

- Border sidebar: `border-r-2 border-gray-100`
- Header sidebar: `border-b-2 border-gray-100`
- Active nav: `border-l-[3px] border-primary bg-primary/8 text-primary font-semibold`
- Inactive nav: hapus `border-l-2 border-transparent`, gunakan hover yang lebih clean
- Ganti `Bike` duplikat (Bikes & Gear) → `Package` dari Lucide
- Header topbar: tampilkan nama halaman aktif berdasarkan `useLocation()`
- Bottom profile: `border-t-2 border-gray-100`
- Sidebar overlay: ganti `<div onClick>` → `<button>` dengan `aria-label="Close menu"`
- Topbar lebih clean: hapus dead space kiri

---

### Phase 3 — Dashboard (PR #86)

**Branch:** `feat/ui-dashboard`
**Files:**

- `client/src/pages/DashboardPage.tsx`
- `client/src/features/dashboard/components/WeeklyDistanceChart.tsx`
- `client/src/features/dashboard/components/KpiCard.tsx`
- `client/src/features/dashboard/components/RecentActivities.tsx`
- `client/src/features/dashboard/components/MaintenanceAlerts.tsx`
- `client/src/features/dashboard/components/GoalProgress.tsx`
- `client/src/features/dashboard/components/UpcomingEvents.tsx`
- `client/src/features/dashboard/components/BudgetSummary.tsx`
- `client/src/features/dashboard/components/BikeHero.tsx`

**Scope:**

- `DashboardPage`: hapus heading "Dashboard" (BikeHero sudah replace), gunakan `PageHeader` untuk fallback
- `WeeklyDistanceChart` → redesign jadi `ActivitySummaryCard`: 3 stat besar horizontal (Total Distance, Total Rides, Moving Time) + elevation gain. Hapus chart library, pure Tailwind cards
- `KpiCard`: fix dynamic Tailwind JIT — ganti `iconColor` string prop jadi explicit color object di `DashboardPage.tsx`. Tambah `focus-visible:ring` ke link wrapper kalau perlu
- `RecentActivities`: format activity type dengan `formatActivityType()`, tambah "View all activities →" link ke `/activities`, `rounded-xl`, hover state lebih solid
- `MaintenanceAlerts`: ganti emoji `⚠️` → Lucide `AlertTriangle`, `✓` → Lucide `CheckCircle2`, `rounded-xl`
- `GoalProgress`: tambah "View all goals →" link, `rounded-xl`
- `UpcomingEvents`: tambah "View all events →" link, `rounded-xl`
- `BudgetSummary`: format category label dengan `formatEnumLabel()`, tambah "View finances →" link, `rounded-xl`
- `BikeHero`: tambah explicit `width`/`height` ke `<img>` untuk CLS, aria-label ke bike switcher buttons

---

### Phase 4 — Login Page (PR #87)

**Branch:** `feat/ui-login`
**Files:**

- `client/src/pages/LoginPage.tsx`

**Scope:**

- Ganti emoji 🚴 → `<img src="/logo.png" alt="Veloer" className="h-12 w-auto">`
- Split layout: kiri form (max-w-md), kanan hero image (road-bike.png, hidden di mobile)
- Background kiri: `bg-white`, kanan: gradient gelap dengan gambar sepeda
- Copy: ganti "Your Personal Cycling ERP" → "Track your rides, gear, and training in one place"
- Tagline "Track. Maintain. Ride." tetap ada tapi lebih subtle
- Strava button: tambah loading state (`useState`), disabled saat loading, tambah `focus-visible:ring`
- `<h1>` untuk nama app

---

### Phase 5 — Activities (PR #88)

**Branch:** `feat/ui-activities`
**Files:**

- `client/src/pages/ActivitiesPage.tsx`
- `client/src/features/activity/components/ActivityList.tsx`
- `client/src/features/activity/components/ActivityFilters.tsx`
- `client/src/features/activity/components/ActivityStatsBar.tsx`

**Scope:**

- `ActivitiesPage`: pakai `PageHeader`, `h2` → `h1`, Sync button pakai `focus-visible:ring`
- `ActivityList`: format type dengan `formatActivityType()`, pakai `Badge` untuk type, `rounded-xl` container, hover state row lebih solid, `<table>` tambah `<caption className="sr-only">`
- `ActivityFilters`: form inputs konsisten dengan design system (border, focus ring)
- `ActivityStatsBar`: pakai Lucide icons untuk stat items, `rounded-xl`

---

### Phase 6 — Inventory (PR #89)

**Branch:** `feat/ui-inventory`
**Files:**

- `client/src/pages/InventoryPage.tsx`
- `client/src/features/inventory/components/BikeCard.tsx`
- `client/src/features/inventory/components/ComponentList.tsx`

**Scope:**

- `InventoryPage`: pakai `PageHeader`, `h1`, ganti inline delete modals → `ConfirmDialog`
- `BikeCard`: `rounded-xl`, visual hierarchy lebih solid, pakai `Badge` untuk status bike
- `ComponentList`: improve table, pakai `Badge` untuk status komponen, `<caption className="sr-only">`
- Empty state: pakai `EmptyState` component dengan Lucide `Bike` icon

---

### Phase 7 — Maintenance, Finance, Goals, Events (PR #90)

**Branch:** `feat/ui-modules`
**Files:**

- `client/src/pages/MaintenancePage.tsx`
- `client/src/pages/FinancePage.tsx`
- `client/src/pages/GoalsPage.tsx`
- `client/src/pages/EventsPage.tsx`
- Komponen terkait (MaintenanceCard, TransactionList, dll) jika ada emoji/inline confirm

**Scope:**

- Semua: `PageHeader`, `h1`, `EmptyState`, `ConfirmDialog`
- Format semua enum value
- Konsistensi badge, form inputs, button styles
- `rounded-xl` di semua cards

---

### Phase 8 — Settings (PR #91)

**Branch:** `feat/ui-settings`
**Files:**

- `client/src/pages/SettingsPage.tsx`

**Scope:**

- `h2` → `h1`
- "Logout" → "Sign out"
- Save + Sign out: pisahkan ke dua area (Save di footer form, Sign out di section Danger Zone tersendiri di bawah)
- Avatar `<img>` tambah `width={48}` `height={48}` untuk CLS
- Section cards: `rounded-xl`
- Form inputs: konsisten dengan design system
- Saved message: ganti plain text → banner dengan `CheckCircle2` icon
- "Saving..." state: disable semua form saat saving

---

### Phase 9 — Training Plans & Workouts (PR #92)

**Branch:** `feat/ui-training`
**Files:**

- `client/src/pages/TrainingPlansPage.tsx`
- `client/src/pages/TrainingPlanDetailPage.tsx`
- `client/src/pages/PlanRetrospectivePage.tsx`
- `client/src/features/training/components/WorkoutDetail.tsx`
- `client/src/features/training/components/WorkoutCalendar.tsx`

**Scope:**

- Semua pages: `PageHeader`, `h1`
- `WorkoutDetail`: ganti overlay `<div onClick>` → `<button>` backdrop, tambah `useEffect` untuk Escape key handler, format status badge raw value
- `WorkoutCalendar`: override react-big-calendar default styles ke primary green, konsisten dengan tema
- Status badges: format raw value (`planned` → `Planned`, `completed` → `Completed`)
- `rounded-xl` konsisten

---

## Perubahan Global

| Item              | Sebelum                          | Sesudah                                           |
| ----------------- | -------------------------------- | ------------------------------------------------- |
| Font              | system-ui (Inter tidak loaded)   | Inter 400/500/600/700 via Google Fonts            |
| Card radius       | `rounded-lg` mixed               | `rounded-xl` konsisten                            |
| Focus ring        | tidak ada                        | `focus-visible:ring-2 focus-visible:ring-primary` |
| Heading halaman   | `<h2>` semua                     | `<h1>` satu per halaman                           |
| Empty state emoji | 🚲 🚴 ✓ ⚠️                       | Lucide icon + EmptyState component                |
| Confirm dialog    | inline `<div>` fixed modal       | `ConfirmDialog` reusable                          |
| Activity type     | `VirtualRide` raw                | `Virtual Ride` formatted                          |
| Budget category   | `bike_parts` raw                 | `Bike Parts` formatted                            |
| Maintenance icon  | ⚠️ emoji                         | Lucide `AlertTriangle`                            |
| Button focus      | tidak ada                        | `focus-visible:ring-2`                            |
| Sidebar border    | `border-r border-gray-200`       | `border-r-2 border-gray-100`                      |
| Active nav        | `bg-primary-50 text-primary-700` | `border-l-[3px] border-primary bg-primary/8`      |

---

## PR Summary

| PR        | Phase          | Branch               | Est. Files    |
| --------- | -------------- | -------------------- | ------------- |
| #84       | Foundation     | `feat/ui-foundation` | 8             |
| #85       | Layout/Sidebar | `feat/ui-layout`     | 1             |
| #86       | Dashboard      | `feat/ui-dashboard`  | 9             |
| #87       | Login          | `feat/ui-login`      | 1             |
| #88       | Activities     | `feat/ui-activities` | 4             |
| #89       | Inventory      | `feat/ui-inventory`  | 3             |
| #90       | Modules        | `feat/ui-modules`    | 4+            |
| #91       | Settings       | `feat/ui-settings`   | 1             |
| #92       | Training       | `feat/ui-training`   | 5             |
| **Total** |                |                      | **~36 files** |

---

## Verification Checklist (per PR)

- [ ] `npm run type-check` bersih
- [ ] Tidak ada emoji tanpa `aria-hidden="true"` di file yang diubah
- [ ] Tidak ada `<h2>` sebagai heading halaman utama
- [ ] Tidak ada raw enum value yang ditampilkan
- [ ] Semua button punya `focus-visible:ring-2`
- [ ] Semua icon-only button punya `aria-label`
- [ ] Semua card/container pakai `rounded-xl`
