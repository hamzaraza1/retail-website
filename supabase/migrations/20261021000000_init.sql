-- Shop Builder — initial schema, RLS and storage (PLAN.md §3).
--
-- Differences from the PLAN.md sketch, on purpose:
--   * product_images and product_variants also carry shop_id (CLAUDE.md: every table has
--     shop_id) with a composite FK so it always matches the parent product's shop.
--   * shops.niche (PLAN.md §8) and shops.trust_items (§5.6 editable trust strip).
--   * admins table for the super-admin role (§3 RLS rules).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.admins (
  user_id uuid primary key references auth.users on delete cascade,
  created_at timestamptz not null default now()
);

create table public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users not null,
  slug text unique not null
    check (slug ~ '^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$'),
  name text not null,
  niche text not null default 'mobile',
  tagline text,
  hero_title text,
  hero_description text,
  logo_url text,
  banner_url text,
  banner_mobile_url text,
  theme_color text default '#1D4ED8' check (theme_color ~ '^#[0-9A-Fa-f]{6}$'),
  whatsapp_number text not null check (whatsapp_number ~ '^923[0-9]{9}$'),
  phone text,
  address text,
  maps_url text,
  timings text,
  tiktok_url text,
  instagram_url text,
  footer_about text,
  delivery_policy text,
  return_policy text,
  warranty_note text,
  trust_items jsonb not null default '[]',   -- [{"title":"Checked phones","detail":"..."}]
  seo_title text,
  seo_description text,
  plan text check (plan in ('monthly','yearly','trial')) default 'trial',
  plan_expires_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);
create index on public.shops (owner_id);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops on delete cascade not null,
  name text not null,
  slug text not null,
  description text,
  sort_order int default 0,
  show_on_home boolean default true,
  is_visible boolean default true,
  unique (shop_id, slug)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops on delete cascade not null,
  category_id uuid references public.categories on delete set null,
  brand text,
  model_name text not null,
  slug text not null,
  condition text check (condition in ('new','used','open_box')) default 'new',
  condition_rating text,
  battery_health int check (battery_health between 0 and 100),
  repair_history text,
  description text,
  has_box boolean default true,
  box_contents text[] default '{}',
  warranty text,
  colors jsonb default '[]',
  features jsonb default '[]',
  specs jsonb default '[]',
  tiktok_video_url text,
  is_featured boolean default false,
  is_visible boolean default true,
  show_reviews boolean default true,
  seo_title text,
  seo_description text,
  created_at timestamptz default now(),
  unique (shop_id, slug),
  unique (id, shop_id)                      -- target for child composite FKs
);
create index on public.products (shop_id, category_id);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null,
  product_id uuid not null,
  url text not null,
  label text,
  sort_order int default 0,
  foreign key (product_id, shop_id) references public.products (id, shop_id) on delete cascade
);
create index on public.product_images (product_id, sort_order);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null,
  product_id uuid not null,
  storage text,
  ram text,
  pta_status text check (pta_status in ('pta','non_pta','na')) default 'na',
  price int not null check (price >= 0),
  sale_price int check (sale_price >= 0),
  in_stock boolean default true,
  sort_order int default 0,
  foreign key (product_id, shop_id) references public.products (id, shop_id) on delete cascade
);
create index on public.product_variants (product_id, sort_order);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops on delete cascade not null,
  product_id uuid references public.products on delete set null,
  variant_id uuid references public.product_variants on delete set null,
  snapshot jsonb not null,
  status text check (status in ('pending','confirmed','delivered','cancelled')) default 'pending',
  customer_name text,
  customer_phone text,
  address text,
  color text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on public.orders (shop_id, status, created_at desc);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops on delete cascade not null,
  product_id uuid references public.products on delete set null,
  type text check (type in ('text','video')) not null,
  customer_name text,
  location text,
  product_label text,
  text text,
  rating int check (rating between 1 and 5) default 5,
  tiktok_url text,
  is_visible boolean default true,
  sort_order int default 0,
  created_at timestamptz default now(),
  check (type <> 'video' or tiktok_url is not null)
);
create index on public.reviews (shop_id, sort_order);

create table public.events (
  id bigint generated always as identity primary key,
  shop_id uuid references public.shops on delete cascade not null,
  product_id uuid references public.products on delete set null,
  type text check (type in ('shop_view','product_view','whatsapp_click')) not null,
  referrer text,
  created_at timestamptz default now()
);
create index on public.events (shop_id, created_at);

-- Keep orders.updated_at fresh.
create function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger orders_touch_updated_at
  before update on public.orders
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- RLS helpers (security definer so policies don't recurse through RLS)
-- ---------------------------------------------------------------------------

create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create function public.owns_shop(p_shop_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.shops where id = p_shop_id and owner_id = auth.uid()
  );
$$;

create function public.shop_is_public(p_shop_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.shops where id = p_shop_id and is_active
  );
$$;

create function public.product_is_public(p_product_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.products p
    join public.shops s on s.id = p.shop_id
    where p.id = p_product_id and p.is_visible and s.is_active
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
--   anon/public: read visible rows of active shops
--   owner:       full access to their shop's rows
--   admin:       full access everywhere
--   orders/events are written by the server with the service role (bypasses RLS)
-- ---------------------------------------------------------------------------

alter table public.admins           enable row level security;
alter table public.shops            enable row level security;
alter table public.categories       enable row level security;
alter table public.products         enable row level security;
alter table public.product_images   enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders           enable row level security;
alter table public.reviews          enable row level security;
alter table public.events           enable row level security;

-- admins
create policy "admins: admin read" on public.admins
  for select to authenticated using (public.is_admin());

-- shops
create policy "shops: public read active" on public.shops
  for select to anon, authenticated using (is_active);
create policy "shops: owner read" on public.shops
  for select to authenticated using (owner_id = auth.uid());
create policy "shops: owner update" on public.shops
  for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "shops: admin all" on public.shops
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Owners must not change billing fields themselves; only admins (or the service role) may.
create function public.guard_shop_admin_fields() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is not null and not public.is_admin() and (
       new.owner_id        is distinct from old.owner_id
    or new.slug            is distinct from old.slug
    or new.plan            is distinct from old.plan
    or new.plan_expires_at is distinct from old.plan_expires_at
    or new.is_active       is distinct from old.is_active
  ) then
    raise exception 'Only an admin can change owner, slug, plan or active status';
  end if;
  return new;
end $$;

create trigger shops_guard_admin_fields
  before update on public.shops
  for each row execute function public.guard_shop_admin_fields();

-- categories
create policy "categories: public read" on public.categories
  for select to anon, authenticated
  using (is_visible and public.shop_is_public(shop_id));
create policy "categories: owner all" on public.categories
  for all to authenticated
  using (public.owns_shop(shop_id)) with check (public.owns_shop(shop_id));
create policy "categories: admin all" on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- products
create policy "products: public read" on public.products
  for select to anon, authenticated
  using (is_visible and public.shop_is_public(shop_id));
create policy "products: owner all" on public.products
  for all to authenticated
  using (public.owns_shop(shop_id)) with check (public.owns_shop(shop_id));
create policy "products: admin all" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- product_images
create policy "product_images: public read" on public.product_images
  for select to anon, authenticated using (public.product_is_public(product_id));
create policy "product_images: owner all" on public.product_images
  for all to authenticated
  using (public.owns_shop(shop_id)) with check (public.owns_shop(shop_id));
create policy "product_images: admin all" on public.product_images
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- product_variants
create policy "product_variants: public read" on public.product_variants
  for select to anon, authenticated using (public.product_is_public(product_id));
create policy "product_variants: owner all" on public.product_variants
  for all to authenticated
  using (public.owns_shop(shop_id)) with check (public.owns_shop(shop_id));
create policy "product_variants: admin all" on public.product_variants
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- reviews
create policy "reviews: public read" on public.reviews
  for select to anon, authenticated
  using (is_visible and public.shop_is_public(shop_id));
create policy "reviews: owner all" on public.reviews
  for all to authenticated
  using (public.owns_shop(shop_id)) with check (public.owns_shop(shop_id));
create policy "reviews: admin all" on public.reviews
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- orders (no public access; inserts come from /api/order-click via service role)
create policy "orders: owner read" on public.orders
  for select to authenticated using (public.owns_shop(shop_id));
create policy "orders: owner update" on public.orders
  for update to authenticated
  using (public.owns_shop(shop_id)) with check (public.owns_shop(shop_id));
create policy "orders: owner delete" on public.orders
  for delete to authenticated using (public.owns_shop(shop_id));
create policy "orders: admin all" on public.orders
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- events (no public access; inserts come from server routes via service role)
create policy "events: owner read" on public.events
  for select to authenticated using (public.owns_shop(shop_id));
create policy "events: admin all" on public.events
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage: public-read bucket for logos, banners and product photos.
-- Object path convention: <shop_id>/<anything>. Owners write only under their shop.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('shop-media', 'shop-media', true, 5242880,
        array['image/webp','image/jpeg','image/png'])
on conflict (id) do nothing;

create policy "shop-media: owner insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'shop-media'
    and (public.is_admin() or public.owns_shop(((storage.foldername(name))[1])::uuid))
  );
create policy "shop-media: owner update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'shop-media'
    and (public.is_admin() or public.owns_shop(((storage.foldername(name))[1])::uuid))
  );
create policy "shop-media: owner delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'shop-media'
    and (public.is_admin() or public.owns_shop(((storage.foldername(name))[1])::uuid))
  );
