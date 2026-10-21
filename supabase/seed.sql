-- Demo shop "Zaib Mobiles", from the sample data in design/*.dc.html.
-- Runs after migrations on `supabase db reset` (local only).
--
-- Demo login (local only):  demo@zaibmobiles.test / demo12345

-- ---------------------------------------------------------------------------
-- Owner account
-- ---------------------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-00000000a001',
  'authenticated', 'authenticated', 'demo@zaibmobiles.test',
  crypt('demo12345', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{}', now(), now(),
  '', '', '', ''
);

insert into auth.identities (
  id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
) values (
  gen_random_uuid(),
  '00000000-0000-0000-0000-00000000a001',
  '00000000-0000-0000-0000-00000000a001',
  'email',
  '{"sub":"00000000-0000-0000-0000-00000000a001","email":"demo@zaibmobiles.test","email_verified":true}',
  now(), now(), now()
);

-- ---------------------------------------------------------------------------
-- Shop
-- ---------------------------------------------------------------------------
insert into public.shops (
  id, owner_id, slug, name, tagline, hero_title, hero_description, theme_color,
  whatsapp_number, phone, address, maps_url, timings, tiktok_url,
  footer_about, delivery_policy, return_policy, warranty_note, trust_items,
  seo_title, seo_description, plan, plan_expires_at
) values (
  '00000000-0000-0000-0000-00000000b001',
  '00000000-0000-0000-0000-00000000a001',
  'zaibmobiles',
  'Zaib Mobiles',
  'New · Used · Accessories',
  E'Naya ho ya used,\nsahi phone, sahi price',
  'PTA approved aur Non-PTA, dono available. TikTok par jo phone dekha, yahan price ke saath milega. WhatsApp par order karein ya dukaan par aa kar check karein.',
  '#1D4ED8',
  '923000000000',
  '+923000000000',
  E'[SHOP NO. / MARKET NAME]\nKarachi',
  'https://maps.google.com/',
  E'Roz 12pm se 10pm\nJumma: 3pm se 10pm',
  'https://www.tiktok.com/',
  '[Shop ke baare mein 1-2 lines, dashboard se edit]',
  'COD available. Karachi mein same day, baaqi Pakistan 2-4 din.',
  '[Warranty / return policy]',
  '[7 din shop check warranty]',
  '[
    {"title":"Checked phones","detail":"Har used phone ki battery aur parts check."},
    {"title":"Shop warranty","detail":"[YOUR WARRANTY, jaise 7 din check warranty]"},
    {"title":"Cash on Delivery","detail":"Karachi mein same day, baaqi Pakistan 2-4 din."},
    {"title":"Exchange offer","detail":"Purana phone de kar naya lein."}
  ]',
  'Zaib Mobiles — New & Used Phones in Karachi',
  'PTA approved aur Non-PTA phones, used iPhones aur accessories. WhatsApp par order karein ya dukaan par aa kar check karein.',
  'trial',
  now() + interval '30 days'
);

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------
insert into public.categories (id, shop_id, name, slug, description, sort_order) values
  ('00000000-0000-0000-0000-00000000c001', '00000000-0000-0000-0000-00000000b001',
   'New Phones', 'new-phones', 'Box pack, official PTA approved phones.', 1),
  ('00000000-0000-0000-0000-00000000c002', '00000000-0000-0000-0000-00000000b001',
   'Used Phones', 'used-phones', 'Checked used phones, battery health aur condition ke saath.', 2),
  ('00000000-0000-0000-0000-00000000c003', '00000000-0000-0000-0000-00000000b001',
   'Accessories', 'accessories', 'Chargers, covers, earbuds aur power banks.', 3);

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------
insert into public.products (
  shop_id, category_id, brand, model_name, slug, condition, condition_rating,
  battery_health, has_box, box_contents, warranty, description, is_featured
)
select '00000000-0000-0000-0000-00000000b001'::uuid, c.id, p.brand, p.model_name, p.slug,
       p.condition, p.condition_rating, p.battery_health, p.has_box, p.box_contents,
       p.warranty, p.description, p.is_featured
from (values
  -- New phones
  ('new-phones', 'Samsung', 'Samsung Galaxy A55 5G', 'samsung-galaxy-a55-5g', 'new', null, null, true,
   '{cable,charger}'::text[], '1 saal official warranty', 'Box pack, official PTA approved.', true),
  ('new-phones', 'Infinix', 'Infinix Note 40', 'infinix-note-40', 'new', null, null, true,
   '{cable,charger}'::text[], '1 saal official warranty', 'Box pack, official PTA approved.', false),
  ('new-phones', 'Tecno', 'Tecno Spark 30', 'tecno-spark-30', 'new', null, null, true,
   '{cable,charger}'::text[], '1 saal official warranty', 'Box pack, official PTA approved.', false),
  ('new-phones', 'Xiaomi', 'Redmi Note 14', 'redmi-note-14', 'new', null, null, true,
   '{cable,charger}'::text[], '1 saal official warranty', 'Box pack, official PTA approved.', false),
  -- Used phones
  ('used-phones', 'Apple', 'iPhone 13', 'iphone-13-used', 'used', '10/10', 87, true,
   '{cable,bill}'::text[], '[7 din shop check warranty]',
   'Used 10/10 condition, koi scratch nahi. Face ID aur True Tone working. Battery health 87%.', true),
  ('used-phones', 'Apple', 'iPhone 12 Pro', 'iphone-12-pro-used', 'used', '9/10', 82, true,
   '{cable}'::text[], '[7 din shop check warranty]', null, true),
  ('used-phones', 'Apple', 'iPhone 11', 'iphone-11-used', 'used', '8/10', 79, false,
   '{}'::text[], '[7 din shop check warranty]', null, false),
  ('used-phones', 'Apple', 'iPhone XS Max', 'iphone-xs-max-used', 'used', '9/10', 85, false,
   '{}'::text[], '[7 din shop check warranty]', null, false),
  ('used-phones', 'Samsung', 'Galaxy S22 Ultra', 'galaxy-s22-ultra-used', 'used', '9/10', null, true,
   '{cable}'::text[], '[7 din shop check warranty]', null, true),
  ('used-phones', 'Samsung', 'Galaxy S21 FE', 'galaxy-s21-fe-used', 'used', '10/10', null, true,
   '{cable}'::text[], '[7 din shop check warranty]', null, false),
  ('used-phones', 'Google', 'Google Pixel 7', 'google-pixel-7-used', 'used', '10/10', null, false,
   '{}'::text[], '[7 din shop check warranty]', null, true),
  ('used-phones', 'Google', 'Google Pixel 6a', 'google-pixel-6a-used', 'used', '9/10', null, false,
   '{}'::text[], '[7 din shop check warranty]', null, false),
  -- Accessories
  ('accessories', null, '25W Fast Charger', '25w-fast-charger', 'new', null, null, true,
   '{}'::text[], '1 saal warranty', 'Type-C fast charger.', true),
  ('accessories', null, 'Wireless Earbuds', 'wireless-earbuds', 'new', null, null, true,
   '{}'::text[], null, 'ANC, 30 ghante battery.', false),
  ('accessories', 'Apple', 'iPhone 13 Silicone Cover', 'iphone-13-silicone-cover', 'new', null, null, false,
   '{}'::text[], null, '6 colors available.', false),
  ('accessories', null, '10,000mAh Power Bank', '10000mah-power-bank', 'new', null, null, true,
   '{}'::text[], null, '20W fast charging.', false)
) as p(category_slug, brand, model_name, slug, condition, condition_rating, battery_health,
       has_box, box_contents, warranty, description, is_featured)
join public.categories c
  on c.shop_id = '00000000-0000-0000-0000-00000000b001' and c.slug = p.category_slug;

-- Rich detail for the hero product (design/Product.dc.html).
update public.products set
  colors = '[{"name":"Midnight","hex":"#1F2937"},{"name":"Starlight","hex":"#F3EEE3"},{"name":"Blue","hex":"#2E5A88"}]',
  features = '[
    {"title":"6.1\" Super Retina XDR display","detail":"OLED screen, dhoop mein bhi saaf"},
    {"title":"A15 Bionic chip","detail":"Games aur apps mein fast performance"},
    {"title":"Dual 12MP camera","detail":"Night mode aur Cinematic video"},
    {"title":"5G support","detail":"Future ke networks ke liye tayyar"},
    {"title":"Face ID","detail":"Fully working, tested"}
  ]',
  specs = '[
    {"key":"Display","value":"6.1 inch OLED"},
    {"key":"Processor","value":"A15 Bionic"},
    {"key":"Camera","value":"12MP + 12MP, 12MP front"},
    {"key":"Battery health","value":"87%"},
    {"key":"Condition","value":"Used 10/10, koi scratch nahi"},
    {"key":"Box","value":"With box (original)"}
  ]',
  repair_history = 'Koi repair nahi, original parts',
  tiktok_video_url = 'https://www.tiktok.com/'
where shop_id = '00000000-0000-0000-0000-00000000b001' and slug = 'iphone-13-used';

-- ---------------------------------------------------------------------------
-- Variants (price depends on storage + PTA)
-- ---------------------------------------------------------------------------
insert into public.product_variants (shop_id, product_id, storage, ram, pta_status, price, sort_order)
select pr.shop_id, pr.id, v.storage, v.ram, v.pta_status, v.price, v.sort_order
from (values
  ('samsung-galaxy-a55-5g',    '256GB', '8GB',  'pta',     124999, 0),
  ('infinix-note-40',          '256GB', '8GB',  'pta',      54999, 0),
  ('tecno-spark-30',           '128GB', '8GB',  'pta',      39999, 0),
  ('redmi-note-14',            '256GB', '8GB',  'pta',      59999, 0),
  ('iphone-13-used',           '128GB', null,   'pta',     148000, 0),
  ('iphone-13-used',           '128GB', null,   'non_pta',  98000, 1),
  ('iphone-13-used',           '256GB', null,   'pta',     165000, 2),
  ('iphone-13-used',           '256GB', null,   'non_pta', 112000, 3),
  ('iphone-12-pro-used',       '256GB', null,   'non_pta',  95000, 0),
  ('iphone-11-used',           '64GB',  null,   'pta',      72000, 0),
  ('iphone-xs-max-used',       '256GB', null,   'non_pta',  48000, 0),
  ('galaxy-s22-ultra-used',    '256GB', '12GB', 'pta',     120000, 0),
  ('galaxy-s21-fe-used',       '128GB', '8GB',  'pta',      58000, 0),
  ('google-pixel-7-used',      '128GB', '8GB',  'non_pta',  62000, 0),
  ('google-pixel-6a-used',     '128GB', '6GB',  'non_pta',  38000, 0),
  ('25w-fast-charger',         null,    null,   'na',        3500, 0),
  ('wireless-earbuds',         null,    null,   'na',        2800, 0),
  ('iphone-13-silicone-cover', null,    null,   'na',        1200, 0),
  ('10000mah-power-bank',      null,    null,   'na',        4500, 0)
) as v(product_slug, storage, ram, pta_status, price, sort_order)
join public.products pr
  on pr.shop_id = '00000000-0000-0000-0000-00000000b001' and pr.slug = v.product_slug;

-- ---------------------------------------------------------------------------
-- Reviews
-- ---------------------------------------------------------------------------
insert into public.reviews (shop_id, product_id, type, customer_name, location, product_label, text, tiktok_url, sort_order)
select '00000000-0000-0000-0000-00000000b001'::uuid,
       (select id from public.products
         where shop_id = '00000000-0000-0000-0000-00000000b001' and slug = r.product_slug),
       r.type, r.customer_name, r.location, r.product_label, r.text, r.tiktok_url, r.sort_order
from (values
  ('text', null::text, '[Customer naam]', 'Gulshan', 'iPhone 13',
   'Used iPhone liya tha, bilkul waisa hi nikla jaisa TikTok video mein dikhaya. Battery health bhi same thi.', null::text, 1),
  ('text', null, '[Customer naam]', 'Hyderabad', 'Galaxy A55',
   'WhatsApp par order kiya, agle din COD par phone aa gaya. Box pack tha.', null, 2),
  ('text', null, '[Customer naam]', 'Saddar', 'Pixel 7',
   'Dukaan par jaa kar check kiya, purana phone exchange mein diya aur achha rate mila.', null, 3),
  ('text', 'iphone-13-used', '[Customer naam]', 'Gulshan', 'iPhone 13',
   'Phone bilkul waisa hi tha jaisa video mein dikhaya. Battery health bhi same nikli.', null, 4),
  ('text', 'iphone-13-used', '[Customer naam]', 'Hyderabad', 'iPhone 13',
   'WhatsApp par baat ki, agle din COD par mil gaya. Packing achhi thi.', null, 5),
  ('video', null, '[Customer naam]', null, 'iPhone 13 · Used',     null, 'https://www.tiktok.com/', 6),
  ('video', null, '[Customer naam]', null, 'Galaxy A55 · New',     null, 'https://www.tiktok.com/', 7),
  ('video', null, '[Customer naam]', null, 'Pixel 7 · Exchange',   null, 'https://www.tiktok.com/', 8),
  ('video', null, '[Customer naam]', null, 'iPhone 12 Pro · Used', null, 'https://www.tiktok.com/', 9)
) as r(type, product_slug, customer_name, location, product_label, text, tiktok_url, sort_order);
