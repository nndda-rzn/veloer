# 12 — Dashboard & Layout Restyle (v2.6.0)

Dokumentasi rencana implementasi restyle UI/UX dashboard dan sidebar Veloer.

---

## Latar Belakang

Dashboard dan sidebar saat ini terasa "AI-banget" — generic, terlalu plain, tidak punya identity. Emoji dipakai sebagai icon (🚴 🚲 🔧 💰 🎯 📅 📋 ⚙️ 👤) yang terlihat tidak profesional. Layout dashboard flat tanpa hierarchy visual yang kuat.

Restyle ini bertujuan:

- Memberikan identity visual yang kuat dengan logo dan gambar sepeda real
- Mengganti emoji dengan icon solid (Lucide React)
- Membuat hero section yang impactful di dashboard
- Mempertahankan warna primary yang sudah ada

---

## Scope

**Fokus restyle:**

- Dashboard page (`DashboardPage.tsx` + komponen dashboard)
- Layout/Sidebar (`Layout.tsx`)
- KpiCard component

**Tidak termasuk (fokus tahap ini):**

- Halaman Activities, Inventory, Maintenance, Finance, Goals, Events, Settings, Training Plans
- Tetapi emoji di halaman lain akan diganti di tahap berikutnya

---

## Assets

| File                | Lokasi                            | Kegunaan                           |
| ------------------- | --------------------------------- | ---------------------------------- |
| `logo.png`          | `client/public/logo.png`          | Logo app di sidebar header         |
| `road-bike.png`     | `client/public/road-bike.png`     | Gambar sepeda road di hero section |
| `mountain-bike.png` | `client/public/mountain-bike.png` | Gambar sepeda MTB di hero section  |

### Mapping tipe sepeda ke gambar

```
road    → /road-bike.png
mtb     → /mountain-bike.png
gravel  → /road-bike.png  (fallback)
hybrid  → /road-bike.png  (fallback)
folding → /road-bike.png  (fallback)
other   → /road-bike.png  (fallback)
```

Hanya 2 gambar tersedia. Jika user punya bike tipe gravel/hybrid/folding/other, tampilkan road-bike.png sebagai fallback.

---

## Dependency Baru

### Lucide React

```bash
cd client
npm install lucide-react
```

- **Versi**: latest (tree-shakeable, ~1.4MB full tapi hanya import yang dipakai)
- **Lisensi**: ISC (bebas pakai)
- **Digunakan untuk**: Sidebar icons, KPI card icons, hero section icons

### Icon mapping untuk sidebar

| Menu             | Emoji lama | Lucide icon                     |
| ---------------- | ---------- | ------------------------------- |
| Dashboard        | 📊         | `LayoutDashboard`               |
| Activities       | 🚴         | `Bike`                          |
| Bikes & Gear     | 🚲         | `Bike` (variant) atau `Package` |
| Maintenance      | 🔧         | `Wrench`                        |
| Finance          | 💰         | `Wallet`                        |
| Goals            | 🎯         | `Target`                        |
| Events           | 📅         | `Calendar`                      |
| Training Plans   | 📋         | `ClipboardList`                 |
| Settings         | ⚙️         | `Settings`                      |
| Profile (bottom) | 👤         | `User`                          |

### Icon mapping untuk KPI cards

| KPI            | Emoji lama | Lucide icon |
| -------------- | ---------- | ----------- |
| Total Distance | 🚴         | `Route`     |
| Total Time     | ⏱️         | `Clock`     |
| Active Bikes   | 🚲         | `Bike`      |
| Budget Used    | 💰         | `Wallet`    |

---

## Perubahan File

### 1. Install Lucide React

```bash
cd client && npm install lucide-react
```

### 2. `client/src/shared/components/layout/Layout.tsx`

**Perubahan:**

- **Sidebar header**: Ganti emoji 🚴 dengan `<img src="/logo.png">` + text "Veloer"
- **Nav items**: Ganti prop `icon: string` (emoji) → `icon: LucideIcon` (component)
- **Active state**: Tambah left border indicator (solid, bukan hanya bg color)
- **Profile link di bottom**: Ganti emoji 👤 → `User` icon
- **Hamburger menu**: Ganti inline SVG → `Menu` icon dari Lucide
- **Header**: Hapus teks "Your Personal Cycling ERP", ganti dengan page title dinamis (opsional) atau kosong
- **Sync button**: Tambah `RefreshCw` icon di depan teks

**Struktur navItems baru:**

```tsx
import {
  LayoutDashboard,
  Bike,
  Wrench,
  Wallet,
  Target,
  Calendar,
  ClipboardList,
  Settings,
  User,
  Menu,
  RefreshCw,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/activities', label: 'Activities', icon: Bike },
  { to: '/inventory', label: 'Bikes & Gear', icon: Bike },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/finance', label: 'Finance', icon: Wallet },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/events', label: 'Events', icon: Calendar },
  { to: '/training-plans', label: 'Training Plans', icon: ClipboardList },
  { to: '/settings', label: 'Settings', icon: Settings },
];
```

### 3. `client/src/features/dashboard/components/KpiCard.tsx`

**Perubahan:**

- Ganti prop `icon?: string` → `icon?: ReactNode`
- Tambah colored icon box (rounded, bg color sesuai tema)
- Angka lebih besar (text-3xl)
- Shadow tipis, border lebih tipis
- Hover effect: subtle lift

**Struktur baru:**

```tsx
interface KpiCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  trend?: string;
  iconColor?: string; // tailwind class untuk bg, e.g. 'bg-blue-500'
}
```

### 4. `client/src/features/dashboard/components/BikeHero.tsx` (NEW)

**Hero section baru di dashboard.**

**Layout:**

```
┌────────────────────────────────────────────────────┐
│  [gradient background: primary-900 → primary-700]  │
│                                                    │
│  Good morning, Ananda          ┌──────────────┐    │
│                                │              │    │
│  Your road bike:               │   [PHOTO]    │    │
│  Polygon Stradalus S8          │  road-bike   │    │
│                                │   .png       │    │
│  ┌────┐ ┌────┐ ┌────┐         │              │    │
│  │1.2k│ │ 48 │ │ 12│         └──────────────┘    │
│  │ km │ │ride│ │hob│                              │
│  └────┘ └────┘ └────┘         [road] [mtb] ←switch│
│                                                    │
└────────────────────────────────────────────────────┘
```

**Props:**

```tsx
interface BikeHeroProps {
  displayName: string | null;
  bikes: Bike[];
  defaultBikeId: string | null;
  activityStats: ActivityStats | null;
}
```

**Behavior:**

- Greeting dinamis berdasarkan jam:
  - 05:00–11:59 → "Good morning"
  - 12:00–17:59 → "Good afternoon"
  - 18:00–04:59 → "Good evening"
- Jika `displayName` null → "Welcome back"
- Bike yang ditampilkan pertama = bike dengan id == `defaultBikeId`, atau bike aktif pertama
- Bike switcher tab hanya muncul kalau user punya >1 bike aktif
- Klik tab → ganti gambar dan info sepeda
- Quick stats: total km sepeda ini, jumlah activities (dari `activityStats`), umur sepeda (dari `purchase_date`)
- Background: gradient `from-primary-900 to-primary-700` atau solid dark
- Text: putih, semi-bold
- Gambar: `object-contain`, max-height ~200px, positioned right

**Mapping gambar:**

```tsx
function getBikeImage(type: Bike['type']): string {
  switch (type) {
    case 'mtb':
      return '/mountain-bike.png';
    default:
      return '/road-bike.png';
  }
}
```

### 5. `client/src/features/dashboard/hooks/useDashboardData.ts`

**Perubahan:**

- Tambah import `settingsApi` dan `UserProfile`
- Tambah state `profile: UserProfile | null`
- Tambah ke `Promise.all`: `settingsApi.getProfile()`
- Return `profile` di hook

### 6. `client/src/features/dashboard/index.ts`

- Export `BikeHero` component

### 7. `client/src/pages/DashboardPage.tsx`

**Perubahan:**

- Import `BikeHero` dan tambah di atas KPI cards
- Pass `profile.display_name`, `bikes`, `profile.default_bike_id`, `activityStats`
- KPI cards: ganti `icon="🚴"` → `icon={<Route className="h-5 w-5" />}`
- Struktur baru:

```tsx
<div className="space-y-6">
  {/* Hero */}
  <BikeHero
    displayName={profile?.display_name ?? null}
    bikes={bikes}
    defaultBikeId={profile?.default_bike_id ?? null}
    activityStats={activityStats}
  />

  {/* KPI Cards */}
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <KpiCard
      label="Total Distance"
      value={...}
      icon={<Route className="h-5 w-5" />}
      iconColor="bg-blue-500"
    />
    ...
  </div>

  {/* Sisa layout sama */}
  ...
</div>
```

---

## Breakdown PR

Mengikuti GitFlow: branch `feat/dashboard-restyle`, squash merge ke `develop`.

### PR #76 — Install Lucide + Layout restyle

**Files:**

- `client/package.json` (install lucide-react)
- `client/src/shared/components/layout/Layout.tsx`

**Scope:**

- Install lucide-react
- Ganti semua emoji di sidebar dengan Lucide icons
- Ganti logo header dengan `logo.png`
- Active state dengan border-left indicator
- Hamburger menu pakai Lucide `Menu`
- Sync button pakai `RefreshCw` icon

### PR #77 — KpiCard restyle

**Files:**

- `client/src/features/dashboard/components/KpiCard.tsx`

**Scope:**

- Ganti prop `icon` ke `ReactNode`
- Tambah colored icon box
- Angka lebih besar
- Shadow + hover effect

### PR #78 — BikeHero component + useDashboardData update

**Files:**

- `client/src/features/dashboard/components/BikeHero.tsx` (NEW)
- `client/src/features/dashboard/hooks/useDashboardData.ts`
- `client/src/features/dashboard/index.ts`

**Scope:**

- Buat `BikeHero` component
- Tambah fetch profile di `useDashboardData`
- Export `BikeHero`

### PR #79 — DashboardPage restructure

**Files:**

- `client/src/pages/DashboardPage.tsx`

**Scope:**

- Tambah `BikeHero` di atas KPI cards
- KPI cards pakai Lucide icons
- Layout final

### PR #80 — Lint, type-check, final review

**Scope:**

- Pastikan `npm run lint` bersih
- Pastikan `npm run type-check` bersih
- Visual review

---

## Design Decisions

### Kenapa Lucide React, bukan Heroicons?

- Lucide punya 1000+ icon (Heroicons ~300)
- Tree-shakeable, hanya import yang dipakai
- Style consistent (stroke-based, 24x24 default)
- Populer di ekosistem React + Tailwind (shadcn/ui pakai Lucide)

### Kenapa gambar PNG, bukan SVG inline?

- User request "bentuk real sepeda, seperti referensi mobil"
- SVG inline tidak bisa mencapai tingkat detail foto realistis
- PNG transparan memberikan flexibilitas posisi dan scaling
- Trade-off: file size lebih besar (2.7MB + 835KB), tapi hanya loaded sekali

### Kenapa hanya 2 gambar?

- User hanya punya 2 sepeda: road bike dan mountain bike
- Tipe lain (gravel, hybrid, folding) di-fallback ke road-bike.png
- Mengurangi kompleksitas dan kebutuhan aset

### Kenapa gradient dark untuk hero?

- Gambar sepeda PNG transparan akan menonjol di background gelap
- Memberikan kontras visual yang kuat dengan KPI cards putih di bawahnya
- Menciptakan hierarchy: hero (dark, bold) → KPI (white, clean) → content (gray-50)

---

## Verification

Sebelum merge ke develop:

```bash
cd client && npm run lint
cd client && npm run type-check
cd client && npm run build
```

Visual check:

- [ ] Sidebar pakai logo.png, bukan emoji
- [ ] Sidebar nav pakai Lucide icons, bukan emoji
- [ ] Active nav punya border-left indicator
- [ ] Dashboard punya hero section dengan gambar sepeda
- [ ] Hero greeting dinamis (morning/afternoon/evening)
- [ ] Bike switcher berfungsi kalau >1 bike aktif
- [ ] KPI cards pakai colored icon box, bukan emoji
- [ ] Tidak ada emoji 🚴 🚲 🔧 💰 🎯 📅 📋 ⚙️ 👤 tersisa di sidebar/dashboard

---

## Estimasi

| PR        | Files       | Estimasi waktu |
| --------- | ----------- | -------------- |
| #76       | 2           | 15 menit       |
| #77       | 1           | 10 menit       |
| #78       | 3           | 25 menit       |
| #79       | 1           | 15 menit       |
| #80       | 0           | 10 menit       |
| **Total** | **7 files** | **~75 menit**  |
