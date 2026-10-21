# Shop Builder — Project Plan

A multi-tenant website builder for local retail shopkeepers in Karachi (first niche: **mobile phone shops**) who already get traffic from TikTok but have no website. Each shop gets a fast, mobile-first catalog site. Customers order through **WhatsApp**, not a checkout. The shopkeeper manages everything from a simple dashboard.

---

## 1. Product summary

| | |
|---|---|
| **Customer** | Local shopkeepers active on TikTok (mobile shops first, other niches later) |
| **Problem** | TikTok brings buyers, but there is no single link with all products and prices. Shopify is expensive (USD) and checkout is too complex for them. |
| **Solution** | One shared platform. Each shop gets `shopname.yourbrand.pk`, a catalog site, and a dashboard. "Order on WhatsApp" replaces checkout. |
| **Pricing** | Rs. 2,000 / month, or yearly (suggested Rs. 18,000 instead of 15,000; decide before launch). Founding-member offer for the first 5–10 shops. |
| **Key value to prove** | Dashboard stats: shop views and WhatsApp clicks per product. This is what drives renewals. |

### Order flow (no checkout)
1. Customer opens product page from TikTok bio / caption link.
2. Picks **storage** and **PTA status** (these change the price for phones).
3. Taps **"WhatsApp par Order karein"**.
4. App records a `pending` order + a `whatsapp_click` event, then opens WhatsApp with a pre-filled message:
   ```
   Assalam o Alaikum! Mujhe yeh phone chahiye:

   iPhone 13 (128GB, PTA)
   Rs. 148,000
   https://zaibmobiles.yourbrand.pk/p/iphone-13-used-pta
   ```
5. Color, delivery address and payment are settled in the WhatsApp chat (text or voice note).
6. Shopkeeper updates the order in the dashboard: Pending → Confirmed → Delivered / Cancelled, and can add customer name, phone, address, color.

The product link in the message shows a **WhatsApp link preview** (photo, title, price) because every product page has Open Graph tags. This is how the shopkeeper sees the product image in chat — `wa.me` links cannot attach images directly.

---

## 2. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | SSR/SSG for SEO and WhatsApp previews, one codebase for storefront + dashboard |
| Styling | **Tailwind CSS** | Fast to build, matches the design tokens below |
| DB / Auth / Storage | **Supabase** (Postgres, Auth, Storage, Row Level Security) | One service, generous free tier |
| Hosting | **Vercel** (wildcard domain `*.yourbrand.pk`) | Subdomains per shop, free/cheap at start |
| Forms | react-hook-form + zod | Validation for the add-product form |
| Images | Client-side resize to WebP (~1200px) before upload | Saves storage and makes pages fast on mobile data |

### Multi-tenancy
- Each shop is a row in `shops` with a unique `slug`.
- `middleware.ts` reads the host: `zaibmobiles.yourbrand.pk` → rewrite to `/s/zaibmobiles/...`.
- `app.yourbrand.pk` → dashboard. Root domain → your marketing site.
- Custom domains later: add `custom_domain` column, map host → shop.
- **All shop data is isolated with Supabase RLS** (`shop_id` on every table, owner can only touch their own rows).

---

## 3. Database schema (Supabase / Postgres)

```sql
-- Shops (one per customer)
create table shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users not null,
  slug text unique not null,                 -- subdomain
  name text not null,
  tagline text,                              -- e.g. "New · Used · Accessories"
  hero_title text,
  hero_description text,
  logo_url text,
  banner_url text,
  banner_mobile_url text,
  theme_color text default '#1D4ED8',
  whatsapp_number text not null,             -- 923XXXXXXXXX format
  phone text,
  address text,
  maps_url text,
  timings text,                              -- free text, e.g. "Roz 12pm–10pm, Jumma 3pm–10pm"
  tiktok_url text,
  instagram_url text,
  footer_about text,
  delivery_policy text,
  return_policy text,
  warranty_note text,
  seo_title text,
  seo_description text,
  plan text check (plan in ('monthly','yearly','trial')) default 'trial',
  plan_expires_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Categories (shopkeeper creates their own)
create table categories (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references shops on delete cascade not null,
  name text not null,                        -- "Used Phones"
  slug text not null,
  description text,
  sort_order int default 0,
  show_on_home boolean default true,         -- appears as a home tab
  is_visible boolean default true,
  unique (shop_id, slug)
);

-- Products
create table products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references shops on delete cascade not null,
  category_id uuid references categories on delete set null,
  brand text,                                -- Apple, Samsung, Infinix...
  model_name text not null,                  -- "iPhone 13"
  slug text not null,
  condition text check (condition in ('new','used','open_box')) default 'new',
  condition_rating text,                     -- "10/10" (used only)
  battery_health int,                        -- % (used only)
  repair_history text,                       -- used only
  description text,
  has_box boolean default true,              -- With box / Without box
  box_contents text[] default '{}',          -- {'cable','charger','cover','bill'}
  warranty text,
  colors jsonb default '[]',                 -- [{"name":"Midnight","hex":"#1F2937"}]
  features jsonb default '[]',               -- [{"title":"A15 Bionic","detail":"Fast performance"}]
  specs jsonb default '[]',                  -- [{"key":"Display","value":"6.1 inch OLED"}]
  tiktok_video_url text,                     -- shown in the product gallery
  is_featured boolean default false,
  is_visible boolean default true,
  show_reviews boolean default true,
  seo_title text,
  seo_description text,
  created_at timestamptz default now(),
  unique (shop_id, slug)
);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products on delete cascade not null,
  url text not null,
  label text,                                -- Front, Back, Battery screenshot...
  sort_order int default 0
);

-- Variants: price depends on storage + PTA status
create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products on delete cascade not null,
  storage text,                              -- "128GB" (null for accessories)
  ram text,
  pta_status text check (pta_status in ('pta','non_pta','na')) default 'na',
  price int not null,                        -- PKR, whole rupees
  sale_price int,
  in_stock boolean default true,
  sort_order int default 0
);

-- Orders created when the WhatsApp button is tapped
create table orders (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references shops on delete cascade not null,
  product_id uuid references products on delete set null,
  variant_id uuid references product_variants on delete set null,
  snapshot jsonb not null,                   -- product name, variant, price at click time
  status text check (status in ('pending','confirmed','delivered','cancelled')) default 'pending',
  customer_name text,
  customer_phone text,
  address text,
  color text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Reviews: text or TikTok video
create table reviews (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references shops on delete cascade not null,
  product_id uuid references products on delete set null,   -- null = shop-wide
  type text check (type in ('text','video')) not null,
  customer_name text,
  location text,
  product_label text,                        -- "iPhone 13 · Used"
  text text,
  rating int check (rating between 1 and 5) default 5,
  tiktok_url text,
  is_visible boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Analytics events (views + WhatsApp clicks)
create table events (
  id bigint generated always as identity primary key,
  shop_id uuid references shops on delete cascade not null,
  product_id uuid references products on delete set null,
  type text check (type in ('shop_view','product_view','whatsapp_click')) not null,
  referrer text,                             -- tiktok / instagram / google / direct
  created_at timestamptz default now()
);
create index on events (shop_id, created_at);
```

**RLS rules:**
- Public (anon) can `select` visible rows of active shops: shops, categories, products, images, variants, reviews.
- Public can `insert` into `events` and `orders` only through a server route (use service role in the API route, not from the browser).
- Owner (`auth.uid() = shops.owner_id`) has full access to rows where `shop_id` is their shop.
- Super-admin (you) via a `admins` table or a custom claim.

---

## 4. Storefront (customer side)

Mobile-first. Most traffic comes from TikTok on phones. Roman Urdu + English copy.

### 4.1 Home (`/`)
1. **Header**: logo, shop name, tagline, search box, WhatsApp button.
2. **Hero banner**: badge, title, description, "Phones dekhein" + "Dukaan ka pata" buttons, banner image (separate mobile image).
3. **Brand pills**: link to category page filtered by brand.
4. **Product tabs**: one tab per category where `show_on_home = true`. Each tab shows 4 products (featured first). Below the grid: **"Saare {category} dekhein"** button → category page.
5. **Trust strip**: Checked phones, Shop warranty, Cash on Delivery, Exchange offer (editable text).
6. **Text reviews**: 3 cards (stars, quote, name, location · product). Link to TikTok reviews.
7. **Video reviews**: vertical 9:16 TikTok embeds (lazy loaded, click to play).
8. **Visit the shop**: address, timings, Google Maps button, Call button, map embed. (Footfall is the core goal.)
9. **Footer**: about, categories, contact, socials, policy, "Powered by [YOUR BRAND]".

### 4.2 Category page (`/c/[slug]`)
- Breadcrumb, title, description, sort (Newest, Price low→high, high→low).
- Filters: **Brand** and **PTA** (PTA Approved / Non-PTA). No "Sab/All" pill — nothing selected = show all; tapping an active pill clears it. Filters live in the URL (`?brand=apple&pta=pta`) so links are shareable.
- Product grid (2 columns on phone), empty state with WhatsApp CTA.

### 4.3 Product page (`/p/[slug]`)
- **Gallery**: photos + a **▶ Video** thumbnail if `tiktok_video_url` is set (TikTok embed plays in the main frame).
- Badges: condition (Used 10/10), With box / Without box, PTA status, In stock.
- **Variant pickers**: Storage and PTA status. Price updates from `product_variants`. Hide a picker if the product has only one option. Out-of-stock combinations are disabled.
- Colors (display only — chosen on WhatsApp).
- **WhatsApp order button** (primary) + Call button. Note: "Color, delivery aur payment WhatsApp par tay hoga".
- **Condition cards** (used phones): battery health, rating, Face ID / True Tone, repair history.
- **Key features** list (tick icons) + **Box mein kya milega** + warranty.
- **Specifications table**.
- **Customer reviews** (product-specific, falls back to shop reviews).
- Related products (same category).

### 4.4 WhatsApp button logic
```ts
// on click
await fetch('/api/order-click', { method: 'POST', keepalive: true,
  body: JSON.stringify({ shopId, productId, variantId }) });   // creates pending order + event
const text = `Assalam o Alaikum! Mujhe yeh phone chahiye:\n\n${name} (${storage}, ${ptaLabel})\nRs. ${price.toLocaleString('en-PK')}\n${productUrl}`;
window.location.href = `https://wa.me/${shop.whatsapp_number}?text=${encodeURIComponent(text)}`;
```
- Never block the redirect on the API call (use `keepalive` / `sendBeacon`).
- Number format: `923001234567` (no `+`, no leading 0). Validate in dashboard.
- Basic rate-limit on the API route (per IP) to avoid fake order spam.

### 4.5 SEO & sharing
- `generateMetadata` per page: product `seo_title`/`seo_description`, falling back to `"{model} {condition} {PTA} Price in Karachi | {shop}"` and the description.
- **Open Graph image = first product image** (critical for WhatsApp/TikTok link previews).
- JSON-LD `Product` schema with `offers` in PKR, `availability`, `itemCondition`.
- Per-shop `sitemap.xml` and `robots.txt`.
- Clean slugs: `/p/iphone-13-used-pta`.
- Shop-level SEO title/description in Shop settings (for the home page).

### 4.6 Performance
- ISR / revalidate on dashboard save (`revalidatePath`).
- `next/image` with WebP, lazy-load below the fold, TikTok embeds load only on tap.
- Target: Lighthouse mobile 90+, page usable on slow 4G.

---

## 5. Shopkeeper dashboard (`app.yourbrand.pk/dashboard`)

Sidebar: **Overview · Products · Orders · Categories · Reviews (text + video) · Shop settings**, plus "Apni shop dekhein ↗".

### 5.1 Overview (stats)
- Shop views, product views, WhatsApp clicks — today / 7 days / 30 days.
- Top products by WhatsApp clicks.
- Traffic source split (TikTok / Instagram / Google / direct) from referrer.
- Pending orders count.

### 5.2 Products — Add / Edit
Sections (matches the design file `Dashboard.dc.html`):
1. **Photos aur video**: upload up to ~8 photos with labels (Front, Back, Battery screenshot…), drag to reorder, first = cover. TikTok video link (shows in product gallery).
2. **Basic info**: Category (+ "Nayi category banayein" inline), Brand, Model name, Condition (Used / New box pack / Open box). Used-only fields appear when Condition = Used: rating, battery health %, repair history. Description.
3. **Variants aur price**: table of Storage × PTA status → Price, Sale price, Stock toggle. "+ Variant add". Colors chips with "+ Color".
4. **Key features**: title + detail rows.
5. **Specifications**: key/value rows. Pre-fill from a built-in spec template when brand + model is chosen (start with a small JSON of popular models; editable).
6. **Box aur warranty**: **With box / Without box** (radio), what's included (cable, charger, cover, bill), warranty dropdown.
7. **SEO (Google search)**: meta title (60 char counter), meta description (160 char counter), URL slug, live Google preview. Auto-filled if left empty.
8. **Shop par kaise dikhe**: Featured, Visible (hide without deleting), Show reviews.
- Buttons: Draft save / Publish.
- Products list: search, filter by category, quick stock toggle, duplicate product (very useful for similar phones).

### 5.3 Orders
- List with status tabs: Pending / Confirmed / Delivered / Cancelled.
- Each order: product snapshot, time, editable customer name, phone, address, color, notes.
- One-tap "Open WhatsApp chat" with the customer once their number is saved.

### 5.4 Categories
- Create, rename, reorder (drag), hide, "show as home tab" toggle. Slug auto-generated.

### 5.5 Reviews
- Add text review (name, location, product label, rating, text) or video review (TikTok link + name + product label). Show/hide, reorder, optionally attach to a product.

### 5.6 Shop settings
- Header/banner: logo, banner (desktop + mobile), hero title, description, theme color.
- Contact: WhatsApp number (validated), phone, TikTok, Instagram.
- Footer/visit: address, Google Maps link, timings, about, delivery/return policy, warranty note, trust-strip texts.
- SEO: home meta title & description.
- Share tools: shop link, per-product short link copy button, **QR code** (download PNG to print for the counter).

### 5.7 Super-admin (you)
- Create shop + owner account, set slug, plan, `plan_expires_at`, suspend/activate.
- Expired plan → storefront shows a soft "temporarily unavailable, WhatsApp us" page; dashboard shows renew banner.

---

## 6. Design system (from the design files)

| Token | Value |
|---|---|
| Ink (text, dark surfaces) | `#0F172A` |
| Muted text | `#556070` |
| Border | `#E5E8EF` / inputs `#C3CAD6` |
| Soft surface | `#F4F6FA` |
| Accent (per-shop `theme_color`) | default `#1D4ED8` |
| WhatsApp button | `#0E7A3F` (passes contrast with white text) |
| PTA badge | bg `#E4F2EA`, text `#0A5C2F` |
| Non-PTA badge | bg `#FCEFD9`, text `#7A4300` |
| Star | `#E8A317` |
| Display font | Bricolage Grotesque 800 |
| Body font | DM Sans 400/500/700 |
| Radius | cards 16–24px, buttons pill (fully rounded), inputs 12px |
| Touch targets | min 44px |

---

## 7. Build phases

**Phase 0 — Setup (day 1)**
Next.js + TS + Tailwind, Supabase project, env vars, schema migration, RLS, seed one demo shop ("Zaib Mobiles") with the sample data from the designs.

**Phase 1 — Storefront (week 1)**
Subdomain middleware, Home, Category, Product pages from seed data, WhatsApp button + `/api/order-click`, SEO metadata + OG images.

**Phase 2 — Dashboard core (week 2)**
Auth (email + password; you create accounts), Shop settings, Categories, Products add/edit with images + variants, revalidation on save.

**Phase 3 — Orders, reviews, stats (week 3)**
Orders list + status updates, Reviews (text + TikTok), events tracking + Overview stats, QR code + share links.

**Phase 4 — Pilot (week 4)**
Super-admin, plan expiry, deploy on Vercel with wildcard domain, onboard 3–5 founding shops, collect feedback.

**Later (V2)**
Courier booking (TCS, Leopards, PostEx), fake-order number blacklist, bulk product upload (Excel), multiple WhatsApp numbers, custom domains, Urdu script toggle, other niches (clothing, shoes) via niche-specific product fields.

---

## 8. Making it multi-niche later
Mobile-phone fields (storage, PTA, battery health, box) are the first **niche template**. Keep niche-specific fields in clearly separated columns/JSON so a clothing template can later use size/color/fabric instead. Store `niche` on `shops` (`mobile` for now) and switch dashboard form sections + product page blocks by niche.

---

## 9. How to use this with Claude Code
1. Create an empty folder, copy `CLAUDE.md`, `PLAN.md` and the `design/` folder into it.
2. Open Claude Code in that folder and work phase by phase. Example prompts:
   - *"Read PLAN.md and CLAUDE.md. Do Phase 0: set up Next.js, Tailwind, Supabase client, and write the SQL migration + RLS policies + seed data for the demo shop."*
   - *"Phase 1: build the storefront Home page. Use design/Main.dc.html as the visual reference."*
   - *"Build the Product page from design/Product.dc.html, including variant pickers and the WhatsApp order flow in section 4.4."*
   - *"Build the dashboard Add/Edit Product form from design/Dashboard.dc.html and section 5.2."*
3. After each phase, run it locally, check on your phone, then move to the next.
