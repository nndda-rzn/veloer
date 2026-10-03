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

| Role      | Font             | Size / weight                          |
| --------- | ---------------- | -------------------------------------- |
| Display   | Instrument Serif | `font-display`, 28–32px (page titles)  |
| Body / UI | Instrument Sans  | 14–16px, weights 400/500/600           |
| Mono      | system mono      | `font-mono`, tabular data where needed |

- **Exactly one `<h1>` per page** (owned by `PageHeader`).
- Headings `text-wrap: balance`; paragraphs `text-pretty`.
- Numbers in tables/metrics use `tabular-nums`.
- Ellipsis is `…` not `...`. Curly quotes `“ ”`.

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
