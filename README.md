# Shop Builder

A multi-tenant shop website builder for local Karachi retailers, starting with mobile phone shops. Each shop gets its own subdomain storefront and a dashboard, and customers order through a WhatsApp button instead of a checkout.

- Full spec: [`PLAN.md`](PLAN.md)
- Working rules for Claude Code: [`CLAUDE.md`](CLAUDE.md)
- Visual reference: [`design/`](design/README.md)

**Stack:** Next.js 15 (App Router, TypeScript strict), Tailwind CSS v4, Supabase (Postgres, Auth, Storage, RLS), Vercel.

## Status

| Phase | | |
|---|---|---|
| 0 | Setup: Next.js, Tailwind tokens, Supabase clients, schema, RLS, seed | ✅ |
| 1 | Storefront: subdomain middleware, Home / Category / Product, WhatsApp flow, SEO | ✅ demo data |
| 2 | Dashboard core | |
| 3 | Orders, reviews, stats | |
| 4 | Pilot | |

## Local setup

```bash
npm install
npm run dev
```

Then open the demo shop at **http://zaibmobiles.localhost:3000** (Chrome, Edge and Firefox resolve `*.localhost` to your machine). Storefront pages are only served on a shop subdomain.

The storefront currently reads the built-in demo shop from `lib/data/demo.ts`, so no database or `.env.local` is needed to preview it. All reads go through `lib/data/index.ts`; connecting a database later means replacing the bodies of those functions only.

| URL | Page |
|---|---|
| `/` | Shop home |
| `/c/used-phones?brand=apple&pta=non_pta&sort=price_asc` | Category with filters (shareable) |
| `/p/iphone-13-used` | Product: variants, WhatsApp order |
| `/products?q=iphone` | Search / all products |
| `/p/iphone-13-used/og` | Generated link-preview image (used when a product has no photo) |
| `/sitemap.xml`, `/robots.txt` | Per-shop SEO files |

### Database

The schema lives in `supabase/migrations/` and demo data in `supabase/seed.sql`. The seed contains the "Zaib Mobiles" shop with 3 categories, 16 products, variants and reviews.

**Local, using the Supabase CLI (needs Docker):**

```bash
npx supabase init               # first time only; keep the existing migrations/seed
npx supabase start
npx supabase db reset           # applies migrations + seed.sql
```

**Hosted Supabase project:**

```bash
npx supabase link --project-ref <ref>
npx supabase db push            # applies migrations
```

On a hosted project, run `seed.sql` only on a dev project. It creates a demo login (`demo@zaibmobiles.test` / `demo12345`).

To make yourself super-admin, run this once in the SQL editor:

```sql
insert into public.admins (user_id) values ('<your auth.users id>');
```

After the schema changes, regenerate the types:

```bash
npx supabase gen types typescript --linked > lib/supabase/types.ts
```

## Layout

```
middleware.ts          <shop>.<domain>/… → /s/<shop>/…
app/s/[shop]/          storefront: home, c/[category], p/[product] (+ og image), products, sitemap, robots
app/api/order-click/   records a pending order + whatsapp_click (logs only in demo mode)
components/storefront/ storefront UI
lib/data/              storefront read API + demo shop data
lib/catalog.ts         product display helpers (labels, variants, JSON fields)
lib/seo.ts             shop URLs, titles, JSON-LD
lib/supabase/          browser.ts, server.ts (RLS as the user), admin.ts (service role, server only), types.ts
lib/format.ts          formatPrice → "Rs. 148,000", slugify
lib/whatsapp.ts        number validation, order message, wa.me links
supabase/migrations/   schema + RLS + storage bucket
supabase/seed.sql      demo shop
design/                mockups (reference only; do not copy their template syntax)
```
