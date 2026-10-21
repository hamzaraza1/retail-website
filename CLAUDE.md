# CLAUDE.md

Project instructions for Claude Code. Full spec is in `PLAN.md` — read it before starting any phase.

## What this is
A multi-tenant shop website builder for local Karachi retailers (first niche: mobile phone shops). Each shop gets a subdomain storefront and a dashboard. Customers order via a WhatsApp button (no checkout).

## Stack
- Next.js (App Router) + TypeScript (strict)
- Tailwind CSS
- Supabase: Postgres, Auth, Storage, RLS
- Deployed on Vercel with wildcard subdomains

## Structure (target)
```
app/
  (marketing)/            root domain landing page
  s/[shop]/               storefront (rewritten from subdomain by middleware.ts)
    page.tsx              home
    c/[category]/page.tsx category page
    p/[product]/page.tsx  product page
  dashboard/              shopkeeper dashboard (app.<domain>)
  admin/                  super-admin
  api/order-click/        creates pending order + whatsapp_click event
components/
  storefront/  dashboard/  ui/
lib/
  supabase/ (server + browser clients)  whatsapp.ts  seo.ts  format.ts
supabase/
  migrations/  seed.sql
design/                   visual reference files (see design/README.md)
```

## Rules
- **Mobile-first.** Most visitors come from TikTok on phones. Check every page at 375px width.
- Copy is Roman Urdu + English, matching the design files. Keep it short and simple.
- Prices are whole PKR integers. Format as `Rs. 148,000` (`toLocaleString('en-PK')`).
- WhatsApp numbers stored as `923XXXXXXXXX`. Message format and click flow: PLAN.md §4.4. Never block the redirect on the API call.
- Every table has `shop_id`; every query is scoped to a shop. RLS must stay on. Never expose the service-role key to the browser.
- Every product page must output Open Graph tags with the first product image (WhatsApp link previews depend on it) and JSON-LD Product schema.
- Revalidate storefront pages when the dashboard saves (`revalidatePath`).
- Images: resize to WebP (~1200px max) on the client before upload to Supabase Storage.
- TikTok embeds load only when tapped (lazy), never on initial page load.
- Accessibility: real `<button>`/`<a>`/`<label>`, touch targets ≥ 44px, text contrast ≥ 4.5:1.
- Keep components small; no new dependency without a reason.

## Design tokens
Use the table in PLAN.md §6. Fonts: Bricolage Grotesque (display, 800) and DM Sans (body) via `next/font/google`. Accent comes from `shops.theme_color` as a CSS variable `--accent`.

## Design reference
`design/*.dc.html` are mockups from a design tool. Read them for layout, sections, copy, spacing and colors. They use a template syntax (`{{value}}`, `<sc-for>`, `<sc-if>`, and a `renderVals()` class with sample data) — do NOT copy that syntax; rebuild as React components with Tailwind. The sample data inside `renderVals()` is good seed data.

## Workflow
Work one phase at a time (PLAN.md §7). At the end of each task: run `npm run build` and `npm run lint`, fix errors, then summarize what changed.
