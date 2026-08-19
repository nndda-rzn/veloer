# 17 — Design System Consolidation + Full UI Redesign (v3.0.0)

Menyatukan seluruh UI app ke satu design language yang minimalis, elegan, dan compact sesuai standar UI/UX profesional.

---

## Latar Belakang

Audit menyeluruh terhadap 13 halaman menemukan **29 inkonsistensi**. Masalah utamanya bukan satu halaman tertentu, tapi **tidak adanya fondasi design system**:

- **Tidak ada shared components** untuk hal dasar: Button, Modal, Alert, Skeleton, Card, Tabs — semua ditulis manual, string class yang sama diulang 6-9 kali
- **Radius tidak konsisten**: `rounded-lg` vs `rounded-xl` untuk card dan modal yang sama fungsinya, tersebar di seluruh halaman
- **Pola data campur aduk**: Activities/Finance pakai tabel padat, Events/Goals/Maintenance pakai stacked cards untuk data serupa
- **Overlay 3 macam opacity** (`bg-black/30`/`40`/`50`), modal 4 bentuk berbeda
- **Badge/chip di-hand-roll 10+ tempat** padahal sudah ada komponen `Badge`
- **Empty state 3 varian**, tombol delete 4 gaya, stat card 4 ukuran berbeda
- **Sidebar 2px border vs topbar 1px border**
- Login hardcode warna `#fc4c02`
- 2 halaman masih pakai native `confirm()`/`alert()`

**Tujuan:** satu sumber kebenaran, satu radius, satu spacing, satu typography scale. Compact untuk data, breathable untuk interaksi.

---

## Prinsip Desain

| Prinsip               | Aturan                                                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Satu sumber kebenaran | Semua elemen berulang pakai shared component — tidak ada class inline untuk button/modal/badge                                                                      |
| Radius seragam        | Cards & modals: `rounded-xl`. Buttons & inputs: `rounded-lg`. Badges: `rounded-full`                                                                                |
| Typography            | Halaman: `text-xl font-bold`. Section: `text-sm font-semibold`. Label: `text-xs uppercase tracking-wider text-gray-400`. Value: `text-sm font-medium text-gray-900` |
| Compact               | Data tabular → table padat (row ~44px). Entitas visual → stacked card dengan base style sama                                                                        |
| Stat card (1 pola)    | `rounded-xl border border-gray-200 bg-white p-4 shadow-sm`, label `text-xs text-gray-500`, value `text-2xl font-bold`                                               |
| Modal                 | Overlay `bg-black/40 p-4`, panel `rounded-xl`, Escape + focus trap + click-outside                                                                                  |
| Form input            | `rounded-lg border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20`, label `text-sm font-medium text-gray-700`                                        |
| Empty state           | Shared `EmptyState`: `rounded-xl border-2 border-dashed border-gray-200 bg-white`                                                                                   |
| Alert                 | `rounded-xl` + `border-{color}-200 bg-{color}-50 p-4 text-sm`                                                                                                       |
| Page rhythm           | `space-y-6` konsisten                                                                                                                                               |

---

## Fase 1 — Fondasi (shared components + standarisasi)

### PR #108 — Shared components inti

**Branch:** `feat/ui-foundation`
**File baru:**

- `client/src/shared/components/ui/Button.tsx`
- `client/src/shared/components/ui/Modal.tsx`
- `client/src/shared/components/ui/Alert.tsx`
- `client/src/shared/components/ui/Skeleton.tsx`
- `client/src/shared/components/ui/Card.tsx`

**File diubah:** `client/src/shared/components/ui/index.ts`

**Button.tsx**

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
  loading?: boolean;
}
```

- `primary`: `rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark`
- `secondary`: outline gray
- `outline`: outline primary
- `danger`: outline red / solid red
- `ghost`: text only
- `sm`: `px-2.5 py-1 text-xs` | `md`: `px-4 py-2 text-sm`
- `loading`: spinner icon + disabled
- Focus ring bawaan: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`

**Modal.tsx**

```tsx
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}
```

- Overlay: `fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4`
- Panel: `rounded-xl bg-white p-6 shadow-xl`
- `sm`: `max-w-sm` | `md`: `max-w-md` | `lg`: `max-w-2xl`
- Escape-close + focus trap + click-outside + auto-focus (bawaan dari ConfirmDialog)
- Header dengan title + close X icon

**Alert.tsx**

```tsx
interface AlertProps {
  variant?: 'error' | 'success' | 'warning' | 'info';
  children: ReactNode;
}
```

- `rounded-xl p-4 text-sm` + `border-{color}-200 bg-{color}-50 text-{color}-700`
- Opsional `dismissible`

**Skeleton.tsx**

```tsx
interface SkeletonProps {
  className?: string; // h-24 rounded-xl etc
}
```

- `animate-pulse bg-gray-100` + `rounded-xl` default

**Card.tsx**

```tsx
interface CardProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}
```

- Base: `rounded-xl border border-gray-200 bg-white`
- `sm`: p-3 | `md`: p-4 | `lg`: p-5

---

### PR #109 — Tabs + standarisasi komponen existing

**Branch:** `feat/ui-tabs-standards`
**File baru:** `client/src/shared/components/ui/Tabs.tsx`
**File diubah:** `EmptyState.tsx`, `Badge.tsx`, `ConfirmDialog.tsx`, `index.ts`

**Tabs.tsx**

```tsx
interface TabsProps {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}
```

- Underline style: `border-b border-gray-200`, active `border-b-2 border-primary text-primary`

**Badge.tsx**

- Tambah `size?: 'sm' | 'md'` (default `sm`)
- Variant tetap: success/warning/danger/info/neutral

**EmptyState.tsx**

- Samakan ke `rounded-xl border-2 border-dashed border-gray-200 bg-white`
- Hapus inkonsistensi `border` vs `border-2`

**ConfirmDialog.tsx**

- Tambah `size?: 'sm' | 'md'`
- Pertahankan Escape + focus trap (sudah benar)

---

### PR #110 — Standarisasi global (token + layout shell)

**Branch:** `fix/ui-global-standards`
**File baru:** `client/src/shared/lib/ui.ts` — konstanta class yang dipakai berulang (inputClass, labelClass, etc)
**File diubah:** Layout.tsx + semua form modal + skeleton yang melenceng

| Area            | Standar                                               |
| --------------- | ----------------------------------------------------- |
| Sidebar borders | `border-r-2` → `border-r` (samakan dengan topbar 1px) |
| Input focus     | semua → `focus:ring-2 focus:ring-primary/20`          |
| Form label      | semua → `text-sm font-medium text-gray-700`           |
| Skeleton        | semua → `rounded-xl`                                  |
| Overlay modal   | semua → `bg-black/40 p-4`                             |
| Error banner    | semua → `rounded-xl` (update yang `rounded-lg`)       |
| Page rhythm     | `space-y-6` (fix PlanRetrospective `space-y-4`)       |

---

## Fase 2 — Terapkan per halaman

### PR #111 — Activities + ActivityDetail

**Branch:** `refactor/ui-activities`
**File diubah:**

- `client/src/pages/ActivitiesPage.tsx` — tombol → Button, error → Alert
- `client/src/features/activity/components/ActivityList.tsx` — wrapper → Card
- `client/src/features/activity/components/ActivityStatsBar.tsx` — stat card → pola seragam
- `client/src/pages/ActivityDetailPage.tsx` — `rounded-lg` → `rounded-xl`, tab → Tabs, back-link standar, pakai PageHeader
- `client/src/features/activity/components/ActivityDetail.tsx` — tile → Card, type chip → Badge

### PR #112 — Finance + Events

**Branch:** `refactor/ui-finance-events`
**File diubah:**

- `client/src/features/finance/components/SummaryCards.tsx` — stat card → pola seragam
- `client/src/features/finance/components/TransactionList.tsx` — inline empty → EmptyState, chip → Badge, tombol → Button, `divide-gray-200` → `divide-gray-100`
- `client/src/features/finance/components/TransactionForm.tsx` — modal → Modal
- `client/src/features/events/components/EventList.tsx` — badge inline → Badge, tombol → Button, inline empty → EmptyState, title `font-medium` → `font-semibold`
- `client/src/features/events/components/EventForm.tsx` — modal → Modal
- `client/src/pages/FinancePage.tsx`, `EventsPage.tsx` — tombol header → Button

### PR #113 — Goals + Maintenance

**Branch:** `refactor/ui-goals-maintenance`
**File diubah:**

- `client/src/features/goals/components/GoalCard.tsx` — badge → Badge, tombol → Button, title → `font-semibold`
- `client/src/features/goals/components/GoalForm.tsx` — modal → Modal
- `client/src/features/maintenance/components/MaintenanceLogList.tsx` — badge → Badge, inline empty → EmptyState
- `client/src/features/maintenance/components/MaintenanceForm.tsx` — modal → Modal, label → `text-sm`
- `client/src/pages/MaintenancePage.tsx` — **hapus dead code apiClient fallback (lines 45-54)**, pakai `useBikes()`
- `client/src/pages/GoalsPage.tsx` — skeleton → `rounded-xl`

### PR #114 — Training Plans (3 halaman)

**Branch:** `refactor/ui-training`
**File diubah:**

- `client/src/pages/TrainingPlansPage.tsx` — ganti `alert()` → Alert, 3 tombol header → Button, skeleton → `rounded-xl`
- `client/src/pages/TrainingPlanDetailPage.tsx` — ganti native `confirm()` → ConfirmDialog, custom header → PageHeader, back-link standar, modal linker → Modal, tombol `py-1.5` → Button sm
- `client/src/features/training/components/TrainingPlanCard.tsx` — badge → Badge
- `client/src/features/training/components/TemplateLibrary.tsx` — modal → Modal (lg), chip → Badge
- `client/src/features/training/components/SmartPlanModal.tsx` — modal → Modal (lg), label → `text-sm`, chip → Badge
- `client/src/features/training/components/WorkoutDetail.tsx` — drawer style disamakan (border-r), badge → Badge
- `client/src/pages/PlanRetrospectivePage.tsx` — `space-y-4` → `space-y-6`, back-link standar

### PR #115 — Dashboard + Settings

**Branch:** `refactor/ui-dashboard-settings`
**File diubah:**

- `client/src/features/dashboard/components/KpiCard.tsx` — value `text-3xl` → `text-2xl` (seragam dengan stat card lain)
- `client/src/features/dashboard/components/WeeklyDistanceChart.tsx` — stat value → `text-2xl`
- `client/src/features/dashboard/components/*.tsx` — wrapper → Card
- `client/src/pages/SettingsPage.tsx` — section → Card, inputClass/labelClass pindah ke `shared/lib/ui.ts`, tombol → Button

### PR #116 — Inventory (Bikes & Gear) — redesign final

**Branch:** `feat/inventory-dense-table`
**File diubah:**

- `client/src/pages/InventoryPage.tsx` — rewrite total
- `client/src/features/inventory/components/BikeCard.tsx` — **hapus** (digantikan BikeTable)
- `client/src/features/inventory/components/ComponentList.tsx` — compact-kan jadi mini-table
- `client/src/features/inventory/components/BikeForm.tsx` — modal → Modal
- `client/src/features/inventory/components/ComponentForm.tsx` — modal → Modal

**Desain final:**

```
┌──────────────────────────────────────────────────────────────┐
│ Bikes & Gear                                      [+ Add Bike] │
├──────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────────┐ │
│ │  [thumb] Name         Road    12,450 km  01/2024   Active │ │
│ │          Brand Model                     [2 ⚠] [Edit][Del]│ │
│ ├──────────────────────────────────────────────────────────┤ │
│ │  [thumb] Name         MTB      3,200 km  06/2023   Active │ │
│ │          Brand Model                           [Edit][Del]│ │
│ │                                                          │ │
│ │  ▼ Components (3)  ──────────────── [+ Add Component]    │ │
│ │  ┌────────────────────────────────────────────────────┐  │ │
│ │  │ Chain     Drivetrain   2,800 km  ▓▓▓ 70%   Active  │  │ │
│ │  │ Cassette  Drivetrain   2,800 km  ▓▓▓ 100%  Failed  │  │ │
│ │  └────────────────────────────────────────────────────┘  │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

- **Table**: row per bike, thumbnail `w-12 h-9 rounded object-cover`, kolom: thumbnail+name (left), type, current km, purchase date, purchase price, alert badge, actions
- **Expand**: klik row → accordion component mini-table di bawah row
- Kolom sekunder `hidden md:table-cell` (pattern Activities)
- Alert badge oranye (dari PR #106) tetap dipertahankan
- Maintenance alert count + status badge di kolom

### PR #117 — Login + polish

**Branch:** `refactor/ui-login-polish`
**File diubah:**

- `client/src/index.css` — tambah token `--color-strava: #fc4c02`
- `client/src/pages/LoginPage.tsx` — `bg-[#fc4c02]` → `bg-strava`, tombol → Button
- Verifikasi akhir seluruh app konsisten (grep untuk `rounded-lg` card, `bg-black/50`, `focus:ring-1`, `text-3xl` yang tersisa)

---

## Urutan Pengerjaan

```
Fase 1:
  #108 Shared components (Button, Modal, Alert, Skeleton, Card)
  #109 Tabs + EmptyState/Badge/ConfirmDialog standarisasi
  #110 Global standards (Layout, form inputs, skeleton, overlay)

Fase 2:
  #111 Activities + ActivityDetail
  #112 Finance + Events
  #113 Goals + Maintenance
  #114 Training Plans
  #115 Dashboard + Settings
  #116 Inventory redesign (dense table)
  #117 Login + polish akhir
  ↓
Release v3.0.0
```

**Catatan:** PR #108 harus selesai dulu sebelum semua PR Fase 2 (mereka depend pada shared components). PR #109-#110 bisa paralel dengan #108 setelah #108 merged.

---

## Kriteria Selesai (Definition of Done)

1. Zero inline button/modal/badge — semua pakai shared components
2. Zero `rounded-lg` pada card surface (kecuali button/input)
3. Zero `bg-black/50` atau `bg-black/30` pada overlay
4. Zero `focus:ring-1` pada form input
5. Semua daftar data memakai pola yang sudah distandarkan
6. Semua stat card identik strukturnya
7. Zero native `confirm()`/`alert()`
8. Zero badge/chip inline (warna di-map manual)
9. Semua skeleton `rounded-xl`
10. `tsc --noEmit` clean + semua halaman terlihat seragam

---

## Status

| PR   | Deskripsi                                                     | Status    |
| ---- | ------------------------------------------------------------- | --------- |
| #108 | Shared components inti (Button, Modal, Alert, Skeleton, Card) | ✅ Merged |
| #109 | Tabs + standarisasi EmptyState/Badge/ConfirmDialog            | ✅ Merged |
| #110 | Standarisasi global (Layout, form, skeleton, overlay)         | ✅ Merged |
| #111 | Activities + ActivityDetail                                   | ✅ Merged |
| #112 | Finance + Events                                              | ✅ Merged |
| #113 | Goals + Maintenance                                           | ✅ Merged |
| #114 | Training Plans                                                | ✅ Merged |
| #115 | Dashboard + Settings                                          | ✅ Merged |
| #116 | Inventory redesign (dense table)                              | ✅ Merged |
| #117 | Login + polish akhir                                          | ✅ Merged |

Semua PR selesai di v3.0.0. Seluruh 10 kriteria Definition of Done terverifikasi clean.

---

## Migration

Tidak ada migration database. Murni frontend refactor.

## Risiko & Mitigasi

| Risiko                                       | Mitigasi                                                                 |
| -------------------------------------------- | ------------------------------------------------------------------------ |
| PR besar merusak halaman yang berfungsi      | Tiap PR kecil (1-3 halaman), type-check tiap step, review sebelum merge  |
| Component shared berubah API di tengah jalan | Definisikan API final di PR #108, jangan ubah setelah itu — hanya extend |
| Kehilangan fitur saat refactor               | TDD ringan: pastikan behavior sama setelah refactor, visual-only change  |
