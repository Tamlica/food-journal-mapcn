# AGENTS.md

## Commands

| Task | Command |
|---|---|
| Dev server | `npm run dev` (Next.js 16, Turbopack) |
| Production build | `npm run build` |
| Lint | `npm run lint` (eslint, no extra flags) |

No test framework is configured. No typecheck script exists; use `npx tsc --noEmit` if needed.

## OpenCode Config

`opencode.json` loads external MapCN documentation instructions from `https://www.mapcn.dev/docs`. These apply to the map component (`components/ui/map.tsx`, `components/map/place-map.tsx`).

## Architecture

Single-page client-only Next.js app. All data flows through the browser Supabase client — there are **no API routes or server components**.

- **`app/page.tsx`** — sole page; "use client"; orchestrates all components and state
- **`app/layout.tsx`** — root layout; dark mode only (`className="dark"` on `<html>`)
- **Two Zustand stores:**
  - `lib/stores/use-food-journal-store.ts` — data layer: places, tags, filters, CRUD with optimistic updates + rollback on error
  - `lib/stores/use-map-ui-store.ts` — UI state: panel open/close, selected place, draft coordinates
- **`lib/supabase/queries.ts`** — all Supabase queries and image uploads
- **`lib/supabase/client.ts`** — singleton browser client (`persistSession: false`, `autoRefreshToken: false`)
- **`components/ui/map.tsx`** — MapLibreGL wrapper; ref type is `MapRef`
- **`lib/data/seed.ts`** — seed data (not auto-run; manually import if needed)

## Key Conventions

- Path alias `@/*` → project root (configured in `tsconfig.json`)
- Tailwind CSS **v4** (not v3); config lives in `app/globals.css`, no `tailwind.config` file
- shadcn/ui style: `new-york`, with CSS variables, lucide icons
- Place IDs are **strings** (UUIDs via `crypto.randomUUID()`), not integers
- Image storage bucket name: `place-images` (hardcoded in `queries.ts`)
- Geocoding uses OpenStreetMap Nominatim directly (no API key, but rate-limited)
- Pricing in IDR (Indonesian Rupiah): range 20,000–200,000, step 5,000

## Supabase Setup

Required env vars in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=<url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<key>
```

Migrations in `supabase/migrations/` must be run in order (prefix-sorted):
1. `20260220_init_food_journal.sql` — base schema (places, tags, place_tags)
2. `20260220_add_place_image.sql` — single image_url column
3. `20260220_price_range_idr.sql` — IDR pricing
4. `20260220_rating_half.sql` — half-step ratings
5. `20260221_add_place_images_array.sql` — image_urls array column
6. `20260221_add_rls_policies.sql` — row-level security
7. `20260221_add_storage_policies.sql` — storage bucket policies

The queries file has fallback logic: if `image_urls` column is missing, it falls back to `image_url` only.

## Data Model

- **PlaceStatus**: `"visited" | "want_to_go" | "avoid"`
- **Place**: string id, name, notes, status, rating (0.5–5.0 or null), priceRange (number or null), visitDate, latitude, longitude, imageUrls (string[]), tagIds (string[]), createdAt, updatedAt
- **JournalTag**: string id, name, color (hex string), createdAt
- Non-visited places have rating forced to `null`
