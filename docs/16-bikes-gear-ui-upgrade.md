# 16 — Bikes & Gear UI Upgrade + Foto Upload (v2.10.0)

Perbaikan UI modul Bikes & Gear (Inventory) dan penambahan dukungan foto bike via Supabase Storage.

---

## Latar Belakang

Audit v2.9.0 menemukan beberapa kelemahan UI di modul Inventory:

1. **`photo_url` ada di DB tapi tidak pernah ditampilkan** — kolom sudah ada sejak migration 002, server (`AddBike`/`UpdateBike`) sudah support, tapi client tidak pernah render foto di `BikeCard`.
2. **`BikeFormData` client tidak include `photo_url`** — user tidak bisa set foto dari form.
3. **Master-detail clunky** — "View Components" button terpisah di bawah card, components muncul di bawah halaman.
4. **Tidak ada indikator maintenance alert di BikeCard** — komponen yang lifespan-nya hampir habis tidak terlihat dari inventory.
5. **Layout monoton** — card text-only tanpa visual hierarchy.

**Keputusan:** Gunakan **Supabase Storage** untuk upload file (bukan sekadar input URL), karena:

- Server sudah pakai `@supabase/supabase-js` v2.112.2 dengan **service role key** → akses Storage sudah tersedia
- Env `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` sudah ada, tidak perlu env baru
- Foto permanen, tidak hilang seperti URL eksternal

---

## Setup Manual di Dashboard Supabase (dilakukan user, sebelum deploy)

### 1. Buat bucket `bike-photos`

- Login ke dashboard Supabase → pilih project
- Sidebar **Storage** → **New bucket**
- Nama: `bike-photos`
- **Public bucket**: AKTIFKAN (centang) — supaya `<img src>` bisa render langsung tanpa token
- File size limit: **5 MB**
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
- Klik **Create bucket**

### 2. Jalankan storage policies di SQL Editor

Sidebar **SQL Editor** → New query → paste:

```sql
-- Bucket: bike-photos

CREATE POLICY "bike-photos public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'bike-photos');

CREATE POLICY "bike-photos auth upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'bike-photos'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "bike-photos owner update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'bike-photos' AND auth.uid() = owner);

CREATE POLICY "bike-photos owner delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'bike-photos' AND auth.uid() = owner);
```

Klik **Run**.

**Catatan:** Policy ini hampir tidak relevan untuk upload via server karena service role selalu bypass RLS. Tetap dibuat untuk:

- Jejak keamanan di repo (migration 017)
- Melindungi jalur direct client di masa depan

---

## Implementasi

### PR #102 — Server: dependency `multer` + upload photo endpoint

**Branch:** `feat/bike-photo-upload`
**File diubah:** `server/package.json` (tambah `multer` + `@types/multer`)
**File baru:** `server/src/interfaces/middleware/upload.middleware.ts`
**File diubah:** `server/src/interfaces/controllers/InventoryController.ts`
**File diubah:** `server/src/interfaces/routes/bikes.routes.ts`
**File diubah:** `server/src/application/use-cases/inventory/UpdateBike.ts` (bila perlu)

**Detail:**

```bash
npm install multer && npm install -D @types/multer
```

**Upload middleware** — `multer` memory storage, validasi:

- MIME type: `image/jpeg`, `image/png`, `image/webp`
- Ukuran maksimal: 5 MB
- Reject selain itu dengan error 400

**Endpoint baru:** `POST /api/bikes/:id/photo`

- Auth middleware (existing)
- Terima `multipart/form-data` field `photo`
- Upload ke Storage: `bike-photos/{userId}/{bikeId}.{ext}`
- Path key gunakan UUID bike supaya unik dan mudah di-replace (overwrite)
- Set `photo_url` ke public URL: `{SUPABASE_URL}/storage/v1/object/public/bike-photos/{path}`
- Update row bikes via `UpdateBike` use-case
- Response: `{ photo_url: string }`

**Dependency injection:** Tambah method upload di `SupabaseBikeRepository` atau buat adapter storage terpisah `application/ports/StoragePort.ts` + `infrastructure/storage/SupabaseStorage.ts` (ikuti pola clean architecture yang sudah ada).

---

### PR #103 — Migration 017: storage policies + bike photo cleanup

**Branch:** `feat/bike-photo-policies`
**File baru:** `supabase/migrations/017_bike_photos_policies.sql`

Isi sama dengan SQL manual di atas (biar ada jejak di repo).

---

### PR #104 — Client: `BikeForm` tambah photo upload + preview

**Branch:** `feat/bike-form-photo`
**File diubah:** `client/src/features/inventory/types/inventory.ts` (tambah `photo_url` ke `BikeFormData`)
**File diubah:** `client/src/features/inventory/api/bike.api.ts` (tambah `uploadPhoto(id, file)`)
**File diubah:** `client/src/features/inventory/components/BikeForm.tsx`

**Detail:**

- `BikeFormData` tambah `photo_url?: string | null`
- Section baru di form: "Bike Photo"
  - Drag-drop zone sederhana (`input type="file" accept="image/*"`)
  - Preview image saat file dipilih (pakai `URL.createObjectURL`)
  - Tombol "Upload" → `bikeApi.uploadPhoto(id, file)` → simpan URL ke state form
  - Saat edit bike: tampilkan foto yang sudah ada (`photo_url`), dengan opsi ganti
  - Saat create bike baru: upload butuh bike id → flow: **create bike dulu → upload foto → update photo_url**. Atau simpan file di state, upload setelah bike dibuat (pakai `await createBike` lalu `uploadPhoto`).
  - Loading state saat upload (spinner di tombol)
  - Error state kalau upload gagal / file terlalu besar / tipe salah

---

### PR #105 — Client: `BikeCard` render foto + fallback type-based image

**Branch:** `feat/bike-card-photo`
**File diubah:** `client/src/features/inventory/components/BikeCard.tsx`

**Detail:**

- Header card sekarang: image banner 16:9 (`aspect-video`, `object-cover`, `rounded-t-xl`)
- Priority render:
  1. `bike.photo_url` (foto user) jika ada
  2. Fallback: `road-bike.png` untuk `road`, `mountain-bike.png` untuk `mtb`, dan icon placeholder untuk type lain
- Status badge overlay di pojok kanan atas image (bukan lagi di bawah nama)
- Nama + brand/model tetap di bawah image
- Hover: image subtle scale (`group-hover:scale-105 transition-transform`)

---

### PR #106 — Client: BikeCard maintenance alert indicator

**Branch:** `feat/bike-card-alerts`
**File diubah:** `client/src/features/inventory/api/bike.api.ts` (tambah `getComponentSummary(bikeId)` atau extend `list()` response)
**File diubah:** `client/src/features/inventory/components/BikeCard.tsx`
**File diubah:** `client/src/features/inventory/hooks/useBikes.ts` (bila perlu)
**File diubah:** `server/src/application/use-cases/inventory/GetBikes.ts` + repository (bila di server-side)

**Dua opsi implementasi:**

**Opsi A (client-side, simple):**

- `useComponents(bikeId)` di-fetch untuk setiap bike → hitung count komponen dengan lifespan ≥ 90% atau `status === 'failed'`
- Simpel tapi N+1 request (buruk kalau banyak bikes)

**Opsi B (server-side, direkomendasikan):**

- Endpoint `GET /api/bikes` extend response jadi `{ bike, alertCount }` atau tambah field `component_alert_count` di response list
- Server hitung count komponen dengan lifespan usage ≥ 90% per bike (query join/single query)
- Satu request saja untuk semua bikes

**UI:**

- Icon kecil `Wrench`/`AlertTriangle` oranye + badge count di pojok kiri atas card (berlawanan dengan status badge)
- Tooltip/aria-label: "X components need attention"
- Kalau 0 → tidak tampil apa-apa

---

### PR #107 — Client: Layout improvement (sidebar detail panel)

**Branch:** `feat/inventory-layout`
**File diubah:** `client/src/pages/InventoryPage.tsx`
**File diubah:** `client/src/features/inventory/components/ComponentList.tsx`

**Detail:**

- Grid 2 kolom: kiri daftar bikes (2-3 kolom cards), kanan detail panel
- Klik card bike → panel detail muncul di kanan (sticky, scrollable)
- Panel berisi: foto bike besar, nama/brand/model, stats (type, km, purchase), list components + Add Component button
- Hapus tombol "View Components" terpisah — klik card langsung select
- Card terpilih: `ring-2 ring-primary` (sudah ada pattern)
- Responsive: di mobile, panel jadi section di bawah (stack)

---

## Urutan Pengerjaan

```
Setup manual Supabase (user, 5 menit) — bucket + policies
  ↓
PR #102 (upload endpoint) — butuh bucket sudah ada untuk test
  ↓
PR #103 (migration policies) — bisa paralel dengan #102
  ↓
PR #104 (BikeForm upload + preview)
  ↓
PR #105 (BikeCard render foto)
  ↓
PR #106 (maintenance alert indicator)
  ↓
PR #107 (layout sidebar detail panel)
  ↓
Release v2.10.0
```

**Catatan:** PR #106 dan #107 bisa dikerjakan tanpa Supabase Storage (independen). Kalau setup manual Supabase belum selesai, kerjakan #106 dan #107 dulu.

---

## Catatan Teknis

- **Env**: Tidak ada env baru. `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` sudah ada.
- **Public URL**: `https://{project-ref}.supabase.co/storage/v1/object/public/bike-photos/{path}`
- **Path convention**: `bike-photos/{userId}/{bikeId}.{ext}` — overwrite otomatis saat ganti foto
- **Storage client**: Pakai `getSupabaseClient()` yang sudah ada — `client.storage.from('bike-photos')`
- **Multer memory storage**: file diterima sebagai Buffer, upload via `.upload(path, buffer, { contentType, upsert: true })`
- **Hapus foto lama**: saat bike dihapus, hapus juga file di Storage (opsional — bisa jadi PR lanjutan). Untuk v1 cukup replace via upsert.
- **LSP errors** di file use-case dengan `@injectable/@inject` adalah false positive — `tsc --noEmit` tetap jadi acuan.

---

## Status

| PR           | Deskripsi                                         | Status    |
| ------------ | ------------------------------------------------- | --------- |
| Setup manual | Buat bucket `bike-photos` + policies di dashboard | ✅ Done   |
| #102         | Server: multer + upload endpoint                  | ✅ Merged |
| #103         | Migration 017: storage policies                   | ✅ Merged |
| #104         | Client: BikeForm photo upload + preview           | ✅ Merged |
| #105         | Client: BikeCard render foto + fallback           | ✅ Merged |
| #106         | Client: maintenance alert indicator               | ✅ Merged |
| #107         | Client: layout sidebar detail panel               | ✅ Merged |

Semua perbaikan selesai di v2.10.0.

---

## Migration

- `017_bike_photos_policies.sql` — storage policies (opsional jika user sudah jalankan manual, tetap dibuat untuk jejak repo)
- Tidak ada perubahan skema tabel `bikes` — kolom `photo_url` sudah ada sejak migration 002
