# 20 — Design System

> Veloer's visual foundation. **Source of truth** is `client/src/index.css` (`@theme` + `:root`).
> Aesthetic direction: **timeless, clean, elegant** — warm neutrals with a deep ride-green.
> Every colour below is verified against WCAG AA (see ratios). No hardcoded values in components.

---

## Direction

| Aspect      | Decision                                                                 |
| ----------- | ------------------------------------------------------------------------ |
| Reference   | Linear · Stripe · GitHub — restrained, functional, data-dense            |
| Personality | Calm, precise, a little editorial (serif display) — not flashy           |
| Banned      | Gradients as decoration, glassmorphism, rainbow KPI chips, pill overload |
| Signature   | Deep ride-green accent + Instrument Serif page titles                    |

---

## Colour tokens

Primary = deep ride-green `#0f6e4e` (**6.25:1** on white → passes AA for text and white-on-brand).
Neutrals = warm **stone** scale.

| Token                | Light     | Contrast on white | Use                               |
| -------------------- | --------- | ----------------- | --------------------------------- |
| `--primary`          | `#0f6e4e` | 6.25:1 ✅         | Brand, primary CTA, links, focus  |
| `--primary-dark`     | `#0c5b41` | 8.11:1 ✅         | Hover                             |
| `--primary-50`       | `#f0f7f3` | —                 | Tinted surfaces, active nav       |
| `--background`       | `#fafaf9` | —                 | Page background                   |
| `--card`             | `#ffffff` | —                 | Cards, sidebar, header            |
| `--foreground`       | `#1c1917` | 17.5:1 ✅         | Headings, primary text            |
| `--muted-foreground` | `#57534e` | 7.63:1 ✅         | Secondary text, labels, captions  |
| `--border`           | `#e7e5e4` | —                 | Dividers, card edges              |
| `--input`            | `#948d88` | 3.27:1 ✅         | Form field boundary (WCAG 1.4.11) |

### Semantic

| Token            | Value     | Contrast on white | Tint (bg)    |
| ---------------- | --------- | ----------------- | ------------ |
| `--success`      | `#047857` | 5.48:1 ✅         | `emerald-50` |
| `--warning`      | `#b45309` | 5.02:1 ✅         | `amber-50`   |
| `--danger`       | `#b91c1c` | 6.47:1 ✅         | `red-50`     |
| `--info`         | `#1d4ed8` | 6.70:1 ✅         | `blue-50`    |
| `--color-strava` | `#fc4c02` | (logo only)       | —            |

**Rule:** never signal hierarchy with a second hue — use opacity (`text-muted-foreground`) or weight.

---

## Typography

Single clean sans-serif (**Geist**) for the whole app, paired with **Geist Mono**
for numeric data. No display/serif face — density and precision take priority in
a dashboard (see the B2B SaaS typography rules in the research notes).

| Role        | Font       | Token / class                              |
| ----------- | ---------- | ------------------------------------------ |
| UI / body   | Geist      | `font-sans`, weights 400/500/600/700       |
| Data values | Geist Mono | `font-mono` + `tabular-nums` (KPI, tables) |

### Type scale — Minor Third (1.2)

| Token          | Size | Line-height | Weight | Use                       |
| -------------- | ---- | ----------- | ------ | ------------------------- |
| `text-caption` | 12px | 1.5         | 400    | metadata, small labels    |
| `text-body-sm` | 14px | 1.5         | 400    | default dense UI (tables) |
| `text-body`    | 16px | 1.6         | 400    | prose, descriptions       |
| `text-h3`      | 16px | 1.4         | 600    | card titles               |
| `text-h2`      | 20px | 1.3         | 600    | section titles            |
| `text-h1`      | 24px | 1.2         | 600    | page titles               |

- **Hierarchy rule:** size = importance, weight = kind, colour = state.
- **Label vs value:** labels are `text-xs text-muted-foreground`; values are
  larger/heavier (and `font-mono` when numeric) so users can scan, not read.
- **Exactly one `<h1>` per page** (owned by `PageHeader`).
- Headings `text-wrap: balance`; paragraphs `text-pretty`.
- Numbers in tables/metrics use `font-mono tabular-nums`.
- Ellipsis is `…` not `...`. Curly quotes `“ ”`.
- Line-height is inversely proportional to size: small text breathes, large
  headings sit tight.

---

## Spacing, radius, shadow

- **Spacing scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 (Tailwind default).
- **Radius:** single base `--radius: 0.5rem`. Cards/inputs/buttons use `rounded-lg` (8px); small chips `rounded-md`. **No `rounded-2xl`+ on structural elements.**
- **Shadow:** none by default — cards use a 1px `border` + subtle ring. Shadows only on overlays (dialog/dropdown/toast).

---

## Component conventions

| Element      | Convention                                                                  |
| ------------ | --------------------------------------------------------------------------- |
| Buttons      | `default` (primary) · `outline`/`secondary` · `ghost` · `danger`. No pills. |
| Cards        | One `<Card>` primitive everywhere. No bespoke card divs.                    |
| Tables       | `<Table>` primitive (`ActivityList`, `TransactionList`).                    |
| Selects      | Shared `selectClass` (`shared/lib/form-styles.ts`) or `<Select>`.           |
| Destructive  | Always `<ConfirmDialog>` — never an immediate delete.                       |
| Empty states | Always `<EmptyState>` with icon + title + optional action.                  |
| Loading      | Skeleton blocks `animate-pulse bg-secondary`, matching final size.          |
| Icons        | Lucide, 16–20px, monochrome (`text-muted-foreground`).                      |

### Shared patterns (use these instead of rebuilding)

| Pattern        | Where                                   | Replaces                                 |
| -------------- | --------------------------------------- | ---------------------------------------- |
| `Section`      | `shared/components/ui/Section.tsx`      | Card walls on form pages (Settings)      |
| `FormField`    | `shared/components/ui/FormField.tsx`    | Hand-rolled label + input + hint + error |
| `Skeleton*`    | `shared/components/ui/Skeleton.tsx`     | Ad-hoc `animate-pulse` blocks            |
| `PageHeader`   | `shared/components/ui/PageHeader.tsx`   | Per-page title markup                    |
| `EmptyState`   | `shared/components/ui/EmptyState.tsx`   | Per-page empty markup                    |
| `TableToolbar` | `shared/components/ui/TableToolbar.tsx` | Per-table search/sort/pagination chrome  |

### Deliberate decisions

- **Native `<select>` for short lists.** Accessibility guidance is consistent that
  a native select beats a scripted dropdown: it brings keyboard, screen-reader
  and platform picker behaviour for free. `selectClass` keeps them visually
  consistent. Do not replace them with a custom component to "tidy up" — that
  trades real accessibility for cosmetic uniformity. A searchable control is only
  justified for very long lists (e.g. timezones, ~400 options).
- **Currency is fixed to IDR.** Amounts are stored in IDR in the database, so
  showing another currency without a conversion rate would misstate values.
- **Formatting preferences are a module store, not a hook.** `formatDistance`,
  `formatDate` and friends are called from 80+ places; a hook would force every
  call site to change. `configureFormatting()` + `PreferencesProvider` keeps the
  call sites untouched (the approach established i18n libraries take).

---

## Motion

- Animate `opacity` / `transform` / explicit properties only — **never `transition: all`**.
- Durations 100–200ms; `transition-colors` for hover, `transition-[width]` for progress bars.
- `prefers-reduced-motion` honoured globally in `index.css`.

---

## Accessibility baseline (verified)

- Focus ring: 2px `--ring` outline globally; components use `focus-visible:ring-2`.
- Skip link to `#main-content` in `Layout`.
- Icon-only buttons have `aria-label`; decorative icons `aria-hidden`.
- Toasts/alerts use `aria-live`.
- Layout uses `h-dvh` (not `100vh`) for mobile correctness.

---

## Files

- Tokens: `client/src/index.css`
- Fonts + meta: `client/index.html`
- Shared UI: `client/src/shared/components/ui/` (`PageHeader`, `EmptyState`, `ConfirmDialog`)
- Form styles: `client/src/shared/lib/form-styles.ts`
