# 04 — Database Schema

> Database: Supabase (PostgreSQL). Total 13 tabel dengan relasi terintegrasi antar modul ERP.

---

## Entity Relationship Diagram

```
users ───────────────────── user_profiles
  │                            │
  │                            │ default_bike_id → bikes
  │
  ├─< activities ────< bikes
  │       │              │
  │       │              ├─< components
  │       │              │       │
  │       │              │       └─< maintenance_logs
  │       │              │       └─< maintenance_schedules
  │       │              │
  │       │              ├─< maintenance_logs
  │       │              └─< maintenance_schedules
  │       │
  │       ├─< transactions (activity_id nullable)
  │       └─< goals (update progress dari aktivitas)
  │
  ├─< transactions ─── bikes (nullable)
  │       │            components (nullable)
  │       │            events (nullable)
  │       └─< budgets
  │
  ├─< goals
  └─< events ──── bikes (nullable)
                 activities (nullable)
```

---

## Tabel: Auth & User

### `users`

Menyimpan data autentikasi & token Strava.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  strava_id BIGINT UNIQUE,
  strava_access_token TEXT,
  strava_refresh_token TEXT,
  strava_token_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_strava_id ON users(strava_id);
```

### `user_profiles`

Profil pengguna & preferensi.

```sql
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  preferred_units TEXT NOT NULL DEFAULT 'metric' CHECK (preferred_units IN ('metric', 'imperial')),
  default_bike_id UUID,  -- FK ke bikes, nullable, set di add later
  timezone TEXT NOT NULL DEFAULT 'Asia/Jakarta',
  currency TEXT NOT NULL DEFAULT 'IDR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## Tabel: Modul 1 — Activity Tracking

### `activities`

Aktivitas bersepeda, sync dari Strava.

```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  strava_id BIGINT UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,  -- Ride, VirtualRide, dll
  start_date TIMESTAMPTZ NOT NULL,
  distance DECIMAL(10,2) NOT NULL,          -- dalam meter
  moving_time INTEGER NOT NULL,              -- dalam detik
  elapsed_time INTEGER NOT NULL,            -- dalam detik
  total_elevation_gain DECIMAL(8,2),        -- dalam meter
  avg_speed DECIMAL(8,2),                   -- m/s
  max_speed DECIMAL(8,2),                   -- m/s
  avg_hr INTEGER,                           -- bpm
  max_hr INTEGER,                           -- bpm
  polyline TEXT,                            -- encoded summary polyline
  bike_id UUID REFERENCES bikes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_start_date ON activities(start_date DESC);
CREATE INDEX idx_activities_bike_id ON activities(bike_id);
```

---

## Tabel: Modul 2 — Bike & Gear Inventory

### `bikes`

Sepeda milik user.

```sql
CREATE TABLE bikes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  type TEXT NOT NULL CHECK (type IN ('road', 'mtb', 'gravel', 'hybrid', 'folding', 'other')),
  purchase_date DATE,
  purchase_price DECIMAL(12,2),             -- IDR
  current_km DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'retired', 'sold')),
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bikes_user_id ON bikes(user_id);

-- Setelah tabel bikes dibuat, update FK di user_profiles
ALTER TABLE user_profiles 
  ADD CONSTRAINT fk_user_profiles_default_bike 
  FOREIGN KEY (default_bike_id) REFERENCES bikes(id) ON DELETE SET NULL;
```

### `components`

Komponen sepeda (rantai, ban, rem, dll).

```sql
CREATE TABLE components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bike_id UUID NOT NULL REFERENCES bikes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                       -- chain, tire, brake_pad, cassette, dll
  category TEXT NOT NULL,                   -- drivetrain, braking, wheel, cockpit, frame, other
  brand TEXT,
  model TEXT,
  install_date DATE NOT NULL,
  install_km DECIMAL(10,2) NOT NULL,        -- km sepeda saat install
  expected_lifespan_km DECIMAL(10,2),        -- estimasi umur (km)
  current_km DECIMAL(10,2) NOT NULL,        -- km sepeda saat ini (update dari bike.current_km)
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'replaced', 'failed')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_components_bike_id ON components(bike_id);
CREATE INDEX idx_components_status ON components(status);
```

---

## Tabel: Modul 3 — Maintenance Log

### `maintenance_logs`

Riwayat service/maintenance.

```sql
CREATE TABLE maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bike_id UUID NOT NULL REFERENCES bikes(id) ON DELETE CASCADE,
  component_id UUID REFERENCES components(id) ON DELETE SET NULL,
  service_date DATE NOT NULL,
  service_km DECIMAL(10,2) NOT NULL,        -- km sepeda saat service
  type TEXT NOT NULL CHECK (type IN ('routine', 'repair', 'replacement', 'cleaning', 'tuning')),
  description TEXT NOT NULL,
  cost DECIMAL(12,2),                       -- IDR
  performed_by TEXT NOT NULL DEFAULT 'self' CHECK (performed_by IN ('self', 'shop')),
  shop_name TEXT,
  next_service_km DECIMAL(10,2),
  next_service_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_maintenance_logs_bike_id ON maintenance_logs(bike_id);
CREATE INDEX idx_maintenance_logs_service_date ON maintenance_logs(service_date DESC);
```

### `maintenance_schedules`

Jadwal maintenance berulang (reminder).

```sql
CREATE TABLE maintenance_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bike_id UUID NOT NULL REFERENCES bikes(id) ON DELETE CASCADE,
  component_id UUID REFERENCES components(id) ON DELETE SET NULL,
  task_name TEXT NOT NULL,                  -- "Chain lube", "Brake check", dll
  interval_km DECIMAL(10,2),                -- interval jarak (nullable jika based on time)
  interval_days INTEGER,                    -- interval waktu (nullable jika based on km)
  last_performed_date DATE,
  last_performed_km DECIMAL(10,2),
  next_due_date DATE,
  next_due_km DECIMAL(10,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_maintenance_schedules_bike_id ON maintenance_schedules(bike_id);
CREATE INDEX idx_maintenance_schedules_active ON maintenance_schedules(is_active);
```

---

## Tabel: Modul 4 — Finance Tracker

### `transactions`

Pengeluaran/pemasukan terkait sepeda.

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL CHECK (category IN ('gear', 'maintenance', 'event', 'nutrition', 'other')),
  amount DECIMAL(12,2) NOT NULL,            -- IDR, always positive
  date DATE NOT NULL,
  description TEXT,
  bike_id UUID REFERENCES bikes(id) ON DELETE SET NULL,
  component_id UUID REFERENCES components(id) ON DELETE SET NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
  payment_method TEXT,                      -- cash, transfer, cc, dll
  merchant TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_transactions_category ON transactions(category);
```

### `budgets`

Budget bulanan/tahunan per kategori.

```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('gear', 'maintenance', 'event', 'nutrition', 'total', 'other')),
  amount DECIMAL(12,2) NOT NULL,            -- IDR
  period TEXT NOT NULL CHECK (period IN ('monthly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_active ON budgets(is_active);
```

---

## Tabel: Modul 5 — Goals & Training

### `goals`

Target & progres training.

```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('distance', 'time', 'elevation', 'activities_count')),
  target_value DECIMAL(12,2) NOT NULL,
  current_value DECIMAL(12,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,                       -- km, hours, m, count
  period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly', 'yearly', 'custom')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  title TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);
```

---

## Tabel: Modul 6 — Events

### `events`

Event sepeda yang diikuti.

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('race', 'gran_fondo', 'charity', 'group_ride', 'tour', 'other')),
  date DATE NOT NULL,
  location TEXT,
  distance DECIMAL(10,2),                   -- km
  registration_fee DECIMAL(12,2),           -- IDR
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'completed', 'cancelled', 'dns', 'dnf')),
  result TEXT,                               -- finishing time, position, dll
  notes TEXT,
  bike_id UUID REFERENCES bikes(id) ON DELETE SET NULL,
  activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_date ON events(date DESC);
```

---

## Row Level Security (RLS)

Karena aplikasi pribadi (single user), RLS tetap di-enable untuk keamanan. Setiap tabel hanya mengizinkan akses berdasarkan `user_id` yang cocok dengan JWT claim.

### Policy Pattern (diterapkan ke semua tabel yang punya `user_id`)

```sql
-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Policy: user hanya bisa lihat data miliknya
CREATE POLICY "user_select_own_activities" ON activities
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: user hanya bisa insert data miliknya
CREATE POLICY "user_insert_own_activities" ON activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: user hanya bisa update data miliknya
CREATE POLICY "user_update_own_activities" ON activities
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: user hanya bisa delete data miliknya
CREATE POLICY "user_delete_own_activities" ON activities
  FOR DELETE USING (auth.uid() = user_id);
```

### Tabel tanpa `user_id` langsung (bikes, components, dll)

Untuk tabel seperti `bikes`, `components`, `maintenance_logs` — akses difilter via join ke `user_id` di parent table, atau dengan menambahkan `user_id` ke tabel tersebut untuk simplifikasi.

**Rekomendasi**: Tambahkan `user_id` ke semua tabel yang membutuhkan RLS langsung (bikes, components, maintenance_logs, maintenance_schedules) untuk simplifikasi policy. Foreign key constraints tetap menjaga integritas data.

---

## Triggers & Functions

### `update_updated_at` — auto-update `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Terapkan ke semua tabel yang punya updated_at
CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_activities
  BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ... ulangi untuk setiap tabel
```

### `update_bike_km_after_activity` — trigger otomatis update km sepeda

```sql
CREATE OR REPLACE FUNCTION update_bike_km_after_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.bike_id IS NOT NULL THEN
    UPDATE bikes 
    SET current_km = current_km + (NEW.distance / 1000)
    WHERE id = NEW.bike_id;
    
    -- Update komponen aktif di bike tersebut
    UPDATE components
    SET current_km = components.current_km + (NEW.distance / 1000)
    WHERE bike_id = NEW.bike_id AND status = 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_bike_km
  AFTER INSERT ON activities
  FOR EACH ROW EXECUTE FUNCTION update_bike_km_after_activity();
```

---

## Migration Files

File-file SQL disimpan di:

```
supabase/migrations/
├── 001_create_users_and_profiles.sql
├── 002_create_bikes_and_components.sql
├── 003_create_activities.sql
├── 004_create_maintenance_tables.sql
├── 005_create_finance_tables.sql
├── 006_create_goals.sql
├── 007_create_events.sql
├── 008_add_foreign_keys.sql          -- cross-module FKs
├── 009_enable_rls_and_policies.sql
└── 010_create_triggers.sql
```

Urutan ini menjaga dependency order: tabel yang dirujuk harus dibuat dulu.

---

## Catatan Penting

1. **Satuan**: 
   - Distance: meter (dari Strava), ditampilkan sebagai km di UI
   - Moving time: detik (dari Strava)
   - Elevation: meter
   - Speed: m/s (dari Strava), ditampilkan sebagai km/h di UI
   - Currency: IDR (Rupiah), tanpa desimal

2. **`current_km` di bikes & components**: 
   - Di-update via trigger saat aktivitas baru di-insert
   - Jika aktivitas di-delete, trigger perlu handle pengurangan km

3. **Soft delete**: Tidak dipakai. Hard delete dengan `ON DELETE CASCADE` atau `SET NULL` sesuai konteks.

4. **Indexing**: Index dibuat di kolom yang sering difilter/sort: `user_id`, `date`, `status`, `bike_id`.
