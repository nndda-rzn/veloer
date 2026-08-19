# 18 — shadcn/ui Migration + Full Layout Redesign (v3.1.0)

Migrasi seluruh UI ke shadcn/ui (Base UI primitives) dengan custom theme hijau Veloer, plus redesign sidebar & topbar. Menggantikan komponen custom `shared/components/ui/` yang di-hand-roll di v3.0.0.

---

## Latar Belakang

Setelah v3.0.0 (design system consolidation), UI sudah konsisten tapi user merasa hasilnya "masih AI banget" — generik, tidak berkarakter. Investigasi menemukan akar masalah: komponen custom (Button, Modal, Tabs, dll) di-hand-roll tanpa primitives, sehingga:

- **A11y tidak lengkap**: Tabs tanpa `role="tablist"`/arrow-key nav, Modal & ConfirmDialog focus trap tidak penuh, Alert tanpa `aria-live`, Skeleton tanpa `prefers-reduced-motion`
- **Form inputs 56+ tempat** mengulang string class inline (`rounded-lg border-gray-300 px-3 py-2 text-sm focus:ring-2...`) — tidak ada komponen `Input`/`Label`
- **Tidak ada** Avatar, DropdownMenu, Tooltip, Sheet, AlertDialog — yang dibutuhkan untuk sidebar modern
- **Layout shell** (sidebar + topbar) masih vanilla, nav flat tanpa footer profil

**Keputusan user:**

- Pakai **shadcn/ui** (bukan library, komponen di-copy ke repo, kita pegang penuh)
- **Full replace bertahap** — semua komponen custom dimigrasi ke shadcn
- **Custom theme hijau Veloer** di atasnya — supaya tidak generik
- Primitives: **Base UI** (`@base-ui-components/react`)
- Sidebar: **shadcn Sheet (mobile) + custom sidebar desktop**
- **Semua kerja lokal. Tanpa push/deploy/commit ke remote.**

**Stack yang sudah siap (verified):**

| Requirement                                            | Status                |
| ------------------------------------------------------ | --------------------- |
| Vite 8.2.1                                             | ✅ prasyarat shadcn   |
| Tailwind CSS v4.3.3 (`@tailwindcss/vite`)              | ✅                    |
| React 19.2.8                                           | ✅                    |
| Alias `@/` → `./src` (vite.config.ts + tsconfig paths) | ✅                    |
| CLI `npx shadcn@latest` v4.18.0                        | ✅ jalan, internet OK |

---

## Prinsip Desain (Custom Theme)

Arah visual: **Light modern**. Pertahankan hijau primary Veloer (`#16a34a`). Bersih, terang, aksen hijau tegas — bukan default shadcn (zinc/generik).

| Token                  | Value                                                      |
| ---------------------- | ---------------------------------------------------------- |
| `--primary`            | `#16a34a` (hijau Veloer)                                   |
| `--primary-foreground` | `#ffffff`                                                  |
| `--background`         | `#ffffff`                                                  |
| `--foreground`         | `#111827` (gray-900)                                       |
| `--muted`              | `#f9fafb` (gray-50)                                        |
| `--muted-foreground`   | `#6b7280` (gray-500)                                       |
| `--border`             | `#e5e7eb` (gray-200)                                       |
| `--radius`             | `0.5rem` (rounder, tidak `0.75` default shadcn yang kotak) |
| `--sidebar-*`          | turunan background/muted/foreground                        |

- **Typography**: Inter tetap (sudah dimuat). Headings `text-wrap: balance`.
- **Motion**: semua transisi via transform/opacity; block `prefers-reduced-motion` global.
- **Tabular numbers** untuk kolom angka (distance, durasi, uang).
- Tetap satu sumber kebenaran: tidak ada class inline untuk button/input/badge setelah migrasi.

---

## Struktur Target

```
client/src/
├── components/                    # ← baru (default shadcn, tidak bentrok)
│   ├── layout/
│   │   └── sidebar.tsx            # custom desktop sidebar (light modern)
│   └── ui/                        # komponen shadcn hasil `npx shadcn add`
│       ├── button.tsx  card.tsx  badge.tsx  tabs.tsx  alert.tsx
│       ├── skeleton.tsx  dialog.tsx  alert-dialog.tsx  sheet.tsx
│       ├── avatar.tsx  dropdown-menu.tsx  tooltip.tsx  separator.tsx
│       ├── input.tsx  label.tsx  textarea.tsx  select.tsx  progress.tsx
│       └── table.tsx
├── lib/
│   └── utils.ts                    # cn() helper (shadcn)
├── shared/
│   └── components/ui/              # sisa custom yang TIDAK punya padanan shadcn
│       ├── PageHeader.tsx          # dipertahankan
│       ├── EmptyState.tsx          # dipertahankan (shadcn tidak punya)
│       └── index.ts                # barrel disesuaikan
```

**Catatan:** folder custom lama `shared/components/ui/` TIDAK dihapus dulu sampai migrasi penuh selesai — menghindari broken imports di tengah jalan. Komponen yang sudah punya padanan shadcn dihapus di fase akhir.

---

## Fase 0 — Setup shadcn + custom theme

### Langkah

```bash
cd client
npx shadcn@latest init -t vite -b base -y
```

Hasil yang diharapkan:

- `client/components.json` (config: base = base-ui, iconLibrary = lucide, cssVariables = true)
- Deps baru: `@base-ui-components/react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`, `shadcn`
- `client/src/lib/utils.ts` — helper `cn()`
- `index.css` ditambah: `@import "tw-animate-css";` + `@import "shadcn/tailwind.css";` + blok CSS variables

### Custom theme (edit `client/src/index.css`)

1. Ganti token shadcn default → hijau Veloer sesuai tabel di atas
2. Pertahankan token Veloer yang sudah ada (`--color-primary-*`, `--color-strava`, dll) — samakan `--primary` dengan `--color-primary` biar satu sumber
3. `@theme` shadcn (`@theme inline`) disesuaikan agar membaca vars Veloer
4. Tambah block:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *,
     ::before,
     ::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
     }
   }
   ```
5. `@utility tabular-nums` → pakai `tabular-nums` bawaan Tailwind

### `client/index.html`

- Tambah `<meta name="theme-color" content="#ffffff">`
- Preload font: `<link rel="preload" as="style" href="...fonts.googleapis...">`

### Verifikasi

- `npm run type-check` clean
- `npm run dev` → UI tidak berubah visual (belum ada komponen baru dipakai)

---

## Fase 1 — Add komponen shadcn

```bash
cd client
npx shadcn@latest add button card badge tabs alert skeleton dialog alert-dialog sheet avatar dropdown-menu tooltip separator input label textarea select progress table -y
```

(17 komponen. `table` untuk ActivityList/BikeTable/TransactionList pakai semantic table shadcn.)

**Catatan Base UI:** komponen shadcn Base UI pakai data-attributes (`data-[state=open]` dsb) dari `shadcn/tailwind.css`. Kalau ada CSS yang butuh penyesuaian, edit langsung di file komponen (kode kita).

### Verifikasi

- `npm run type-check` clean
- Cek 1 komponen (Button) muncul di `components/ui/`, import tanpa error

---

## Fase 2 — Migrasi per komponen

Urutan: yang API-nya mirip dulu, yang form-heavy terakhir. **Type-check tiap selesai satu grup.**

### PR #118 — Button + Card + Badge + Skeleton (komponen dasar)

**Button** — mapping variant:

| Custom (lama)  | shadcn (baru)                                                                             |
| -------------- | ----------------------------------------------------------------------------------------- |
| `primary`      | `default`                                                                                 |
| `secondary`    | `secondary`                                                                               |
| `outline`      | `outline`                                                                                 |
| `danger`       | `destructive`                                                                             |
| `ghost`        | `ghost`                                                                                   |
| `size="sm"`    | `size="sm"`                                                                               |
| `loading` prop | tambah di wrapper: `disabled + Loader2 animate-spin` (extension kecil di file button.tsx) |

Perlu cek pemakaian `className` override di `SettingsPage.tsx:281` (`bg-transparent text-red-600`) — shadcn Button support className append, aman.

**Card** — migrasi ke `Card/CardContent`:

- `GoalCard.tsx` (padding default md)
- `EventList.tsx`, `TrainingPlanCard.tsx`, `MaintenanceLogList.tsx`, `ActivityDetail.tsx`, `BudgetSummary.tsx`, komponen dashboard

**Badge** — **extend variants** di file `badge.tsx` (tambah success/warning/info/neutral sesuai custom lama):

```ts
// tambah di badgeVariants
success: 'bg-green-100 text-green-700 hover:bg-green-100',
warning: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
info: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
danger: 'bg-red-100 text-red-600 hover:bg-red-100',
neutral: 'bg-gray-100 text-gray-600 hover:bg-gray-100',
```

**Skeleton** — ganti langsung (API sama `className`).

### PR #119 — Dialog + AlertDialog + Alert (overlay & feedback)

**Dialog** — migrasi 7 modal:

- `EventForm.tsx`, `TransactionForm.tsx`, `GoalForm.tsx`, `ComponentForm.tsx`, `BikeForm.tsx`, `MaintenanceForm.tsx`, `SmartPlanModal.tsx`
- API: `open/onClose` → `open/onOpenChange`
- `SmartPlanModal` ukuran besar → `DialogContent className="max-w-2xl"`
- Bonus gratis: focus trap + Escape + scroll lock + `overscroll-behavior` dari Base UI

**AlertDialog** — migrasi `ConfirmDialog` di 7 halaman:

- `MaintenancePage`, `FinancePage`, `EventsPage`, `GoalsPage`, `TrainingPlansPage`, `TrainingPlanDetailPage`, `InventoryPage`
- API: `onConfirm` → `onAction`, hapus prop `variant` (pakai `AlertDialogAction` class destructive)

**Alert** — extend variants di `alert.tsx`:

- Tambah `success` / `warning` / `info` (default shadcn cuma destructive/default)
- `role="alert"` + `aria-live="assertive"` untuk error, `aria-live="polite"` untuk success (prop `live?`)

### PR #120 — Tabs + Table

**Tabs** — migrasi 1 pemakaian (`ActivityDetailPage.tsx`):

- API: `active/onChange` → `value/onValueChange`
- Gratis: `role="tablist"`, arrow-key nav, aria-controls, roving tabindex

**Table** — migrasi tabel data:

- `ActivityList.tsx`, `BikeTable.tsx`, `TransactionList.tsx`, `ComponentList.tsx`
- Struktur `Table/TableHeader/TableBody/TableRow/TableCell`
- Pertahankan `tabular-nums` untuk kolom angka

### PR #121 — Input + Label + Select + Textarea (form, paling besar)

Menggantikan `inputClass`/`labelClass` (56+ field inline) di:

- `SettingsPage.tsx` — semua field (display_name, avatar_url, preferred_units, currency, timezone, default_bike_id, ftp, lthr)
- `EventForm.tsx`, `TransactionForm.tsx`, `GoalForm.tsx`, `ComponentForm.tsx`, `BikeForm.tsx`, `MaintenanceForm.tsx`
- `WorkoutForm.tsx`, `TrainingPlanForm.tsx`, `TemplateLibrary.tsx`, `SmartPlanModal.tsx`, `ActivityBikeLinker.tsx`, `ActivityFilters.tsx`, `MaintenancePage.tsx` (bike select)

Pola:

```tsx
// sebelum
<label htmlFor="name" className={labelClass}>Name</label>
<input id="name" className={inputClass} ... />

// sesudah
<div className="space-y-1.5">
  <Label htmlFor="name">Name</Label>
  <Input id="name" ... />
</div>
```

- Select native → pakai shadcn `Select` (untuk yang terlihat, mis. bike select, preferred_units, currency) atau tetap native `<select>` + class Input utk yang sederhana. **Keputusan: pakai shadcn `Select` hanya di 2 tempat penting (preferred_units, default_bike_id), sisanya native + styling agar tidak menambah kompleksitas.** Catatan: `Select` shadcn Base UI pakai Portal + trigger pattern; cek docs via `npx shadcn@latest docs select`.

### Verifikasi per PR

- `npm run type-check` clean
- Cek visual tiap halaman terkait di `localhost:5173`

---

## Fase 3 — Sidebar + Topbar redesign

### PR #122 — Sidebar baru (`client/src/components/layout/sidebar.tsx`)

**Desktop sidebar** (custom, light modern):

```
┌─────────────────────────────┐
│ [logo] Veloer               │  h-16, border-b
├─────────────────────────────┤
│  ● Dashboard                │  active: bg-primary-50 text-primary-700 font-semibold
│    Activities               │  + dot hijau (●) kiri
│    Bikes & Gear             │  inactive: text-gray-600 hover:bg-gray-50
│    Maintenance              │  icon 18px, gap-3, rounded-lg, px-3 py-2.5
│    Finance                  │  focus-visible ring
│    Goals                    │
│    Events                   │
│    Training Plans           │
│    Settings                 │
├─────────────────────────────┤
│  (avatar) Nama User   [⋮]   │  footer: border-t
│  email@example.com          │  klik → /settings, DropdownMenu → Sign out
└─────────────────────────────┘
```

- Header: logo `/logo.png` + "Veloer", link ke `/`
- Nav flat (urutan sekarang, tanpa grouping — keputusan user)
- Item active: `bg-primary-50 text-primary-700` + dot `h-1.5 w-1.5 rounded-full bg-primary`
- Item inactive: `text-gray-600 hover:bg-gray-50 hover:text-gray-900`
- Footer profil: `Avatar` (inisial dari `display_name`/email, fallback `User` icon), nama + email (truncate), `DropdownMenu` dengan item "Profile & Settings" + "Sign out" (danger)
- `Tooltip` pada item sidebar (side="right", ketika icon-only — siap untuk collapsible nanti)

**Mobile drawer** — shadcn `Sheet` (side="left"), ganti overlay manual:

- `SheetTrigger` = hamburger di topbar (md:hidden)
- `SheetContent` berisi sidebar yang sama
- Gratis: focus trap, scroll lock, `overscroll-behavior`

### PR #123 — Layout.tsx + topbar

- `Layout.tsx` dipangkas: state `sidebarOpen` manual → Sheet
- Topbar baru (light modern, nyambung):
  - Kiri: breadcrumb tipis `Veloer / {PageTitle}` (`text-sm text-gray-500`, `Link` "Veloer" → `/`)
  - Kanan: tombol Sync pakai shadcn `Button` (icon `RefreshCw` + label)
  - Status sync: `aria-live="polite"` region
  - `usePageTitle()` tetap (match navItems)
- `navItems` dipindah ke `sidebar.tsx` (atau file `sidebar-data.ts` bersama, biar Layout & Sidebar share)
- Data profil: `useProfile()` + `useAuthContext()` (sudah ada) — compose di Sidebar

### Verifikasi

- Sidebar desktop: active state, hover, keyboard nav, dropdown logout
- Mobile (viewport < md): hamburger, drawer buka/tutup, focus trap
- `npm run type-check` clean

---

## Fase 4 — Bersih-bersih + verifikasi penuh

1. Hapus komponen custom yang sudah diganti dari `shared/components/ui/`:
   - Hapus: `Button.tsx`, `Modal.tsx`, `Alert.tsx`, `Skeleton.tsx`, `Card.tsx`, `Badge.tsx`, `Tabs.tsx`, `ConfirmDialog.tsx`
   - Sisakan: `PageHeader.tsx`, `EmptyState.tsx` (tidak punya padanan shadcn)
2. Hapus `shared/lib/ui.ts` (inputClass/labelClass sudah mati) — pastikan tidak ada referensi tersisa
3. Update barrel `shared/components/ui/index.ts`
4. Pastikan tidak ada sisa import custom (grep `@/shared/components/ui`):
   ```bash
   grep -r "@/shared/components/ui" client/src --include="*.tsx" --include="*.ts"
   ```
   → hanya PageHeader + EmptyState yang tersisa
5. `npm run type-check` → clean
6. `npm run build` → sukses
7. Audit ulang pakai Web Interface Guidelines (web-design-guidelines skill) — khususnya:
   - Focus states semua elemen interaktif
   - `aria-live` pada alert/sync
   - `prefers-reduced-motion`
   - tabular-nums pada kolom angka
   - truncate/line-clamp pada teks user-generated
8. Hard refresh `localhost:5173` (Ctrl+Shift+R), jalanin semua halaman, cek konsistensi visual

---

## Mapping Komponen Lengkap

| Custom lama (`shared/components/ui/`) | shadcn (`components/ui/`)                                                                   | Pemakaian                                                                            |
| ------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `Button`                              | `button`                                                                                    | semua halaman & feature (34 file)                                                    |
| `Card`                                | `card`                                                                                      | GoalCard, EventList, TrainingPlanCard, MaintenanceLogList, ActivityDetail, dashboard |
| `Badge`                               | `badge` + extended variants                                                                 | ActivityList, EventList, GoalCard, BikeTable, dll                                    |
| `Tabs`                                | `tabs`                                                                                      | ActivityDetailPage                                                                   |
| `Alert`                               | `alert` + extended variants                                                                 | semua halaman (error/success/sync result)                                            |
| `Skeleton`                            | `skeleton`                                                                                  | semua loading state                                                                  |
| `Modal`                               | `dialog`                                                                                    | 7 form modal                                                                         |
| `ConfirmDialog`                       | `alert-dialog`                                                                              | 7 halaman delete                                                                     |
| `inputClass`/`labelClass` (inline)    | `input` + `label` + `select`                                                                | 56+ field di 13 file                                                                 |
| — (tidak ada)                         | `avatar`, `dropdown-menu`, `tooltip`, `sheet`, `separator`, `table`, `textarea`, `progress` | sidebar, footer profil, drawer mobile, tabel data                                    |
| `PageHeader`                          | — (dipertahankan)                                                                           | 9 halaman                                                                            |
| `EmptyState`                          | — (dipertahankan)                                                                           | 8 komponen                                                                           |

---

## Urutan Pengerjaan

```
Fase 0:  Setup shadcn + custom theme         → type-check + visual no-change
Fase 1:  Add 17 komponen                     → type-check
Fase 2:
  #118  Button + Card + Badge + Skeleton     → type-check + visual
  #119  Dialog + AlertDialog + Alert          → type-check + visual
  #120  Tabs + Table                          → type-check + visual
  #121  Input + Label + Select + Textarea     → type-check + visual
Fase 3:
  #122  Sidebar baru (desktop + mobile Sheet) → visual
  #123  Layout + topbar                       → visual
Fase 4:  Bersih-bersih + verifikasi penuh     → tsc + build + audit
  ↓
Release v3.1.0
```

**Catatan:** PR #118 harus selesai dulu — semua fase lain tergantung (komponen shadcn sudah terpasang sejak Fase 1, jadi #119-#121 bisa saling paralel setelah #118).

---

## Kriteria Selesai (Definition of Done)

1. Semua komponen custom yang punya padanan shadcn sudah diganti — hanya PageHeader + EmptyState tersisa di `shared/components/ui/`
2. Zero string class input inline (`rounded-lg border-gray-300 px-3 py-2`) — semua pakai `<Input>`/`<Label>`
3. Zero import dari komponen custom lama (grep clean)
4. Tabs keyboard navigable (arrow keys), role tablist benar
5. Dialog & AlertDialog: focus trap, Escape, scroll lock (gratis dari Base UI)
6. Sidebar: active state, dropdown logout, mobile drawer — semua keyboard accessible
7. Custom theme hijau Veloer applied (bukan zinc default shadcn)
8. `prefers-reduced-motion` block ada di index.css
9. `aria-live` pada alert & status sync
10. `npm run type-check` clean + `npm run build` sukses
11. Semua halaman diverifikasi visual di `localhost:5173`

---

## Status

| PR   | Deskripsi                         | Status |
| ---- | --------------------------------- | ------ |
| #118 | Button + Card + Badge + Skeleton  | ⏳     |
| #119 | Dialog + AlertDialog + Alert      | ⏳     |
| #120 | Tabs + Table                      | ⏳     |
| #121 | Input + Label + Select + Textarea | ⏳     |
| #122 | Sidebar baru (desktop + Sheet)    | ⏳     |
| #123 | Layout + topbar                   | ⏳     |

---

## Migration

Tidak ada migration database. Murni frontend. Dependensi baru: `@base-ui-components/react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css`, `shadcn`.

## Risiko & Mitigasi

| Risiko                                                     | Mitigasi                                                                                           |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Migrasi form (56+ field) typo / behavior berubah           | Kerjakan per-halaman, type-check tiap selesai, cek visual tiap PR                                  |
| Badge/Alert variants shadcn terbatas                       | Extend manual di file komponen (kode kita sendiri, bebas)                                          |
| `tsconfig` strict (`verbatimModuleSyntax`, noUnusedLocals) | Sesuaikan komponen hasil generate jika perlu (jarang)                                              |
| Dua sistem UI tumpang tindih saat transisi                 | Folder custom lama dibiarkan sampai Fase 4; grep import untuk memastikan nol sisa                  |
| `lucide-react` v1.31 vs ekspektasi shadcn                  | shadcn pakai lucide via `iconLibrary`, kompatibel                                                  |
| Select Base UI API berbeda                                 | Cek `npx shadcn@latest docs select` sebelum pakai; kalau rumit, native select + class Input        |
| Instalasi `init` interaktif                                | Flag `-y -t vite -b base` sudah non-interaktif; fallback manual (components.json + tulis komponen) |
