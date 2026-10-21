// Demo shop "Zaib Mobiles" — same content as supabase/seed.sql, shaped as DB rows.
// Used while no database is connected so the storefront can be previewed on its own.

import type {
  Category,
  Product,
  ProductImage,
  ProductVariant,
  PtaStatus,
  Review,
  Shop,
} from "@/lib/supabase/types";

const SHOP_ID = "demo-shop";

export const shops: Shop[] = [
  {
    id: SHOP_ID,
    owner_id: "demo-owner",
    slug: "zaibmobiles",
    name: "Zaib Mobiles",
    niche: "mobile",
    tagline: "New · Used · Accessories",
    hero_title: "Naya ho ya used,\nsahi phone, sahi price",
    hero_description:
      "PTA approved aur Non-PTA, dono available. TikTok par jo phone dekha, yahan price ke saath milega. WhatsApp par order karein ya dukaan par aa kar check karein.",
    logo_url: null,
    banner_url: null,
    banner_mobile_url: null,
    theme_color: "#1D4ED8",
    whatsapp_number: "923000000000",
    phone: "+923000000000",
    address: "[SHOP NO. / MARKET NAME]\nKarachi",
    maps_url: "https://maps.google.com/",
    timings: "Roz 12pm se 10pm\nJumma: 3pm se 10pm",
    tiktok_url: "https://www.tiktok.com/",
    instagram_url: null,
    footer_about: "[Shop ke baare mein 1-2 lines, dashboard se edit]",
    delivery_policy: "COD available. Karachi mein same day, baaqi Pakistan 2-4 din.",
    return_policy: "[Warranty / return policy]",
    warranty_note: "[7 din shop check warranty]",
    trust_items: [
      { title: "Checked phones", detail: "Har used phone ki battery aur parts check." },
      { title: "Shop warranty", detail: "[YOUR WARRANTY, jaise 7 din check warranty]" },
      { title: "Cash on Delivery", detail: "Karachi mein same day, baaqi Pakistan 2-4 din." },
      { title: "Exchange offer", detail: "Purana phone de kar naya lein." },
    ],
    seo_title: "Zaib Mobiles — New & Used Phones in Karachi",
    seo_description:
      "PTA approved aur Non-PTA phones, used iPhones aur accessories. WhatsApp par order karein ya dukaan par aa kar check karein.",
    plan: "trial",
    plan_expires_at: null,
    is_active: true,
    created_at: "2026-10-01T00:00:00Z",
  },
];

export const categories: Category[] = [
  {
    id: "cat-new",
    shop_id: SHOP_ID,
    name: "New Phones",
    slug: "new-phones",
    description: "Box pack, official PTA approved phones.",
    sort_order: 1,
    show_on_home: true,
    is_visible: true,
  },
  {
    id: "cat-used",
    shop_id: SHOP_ID,
    name: "Used Phones",
    slug: "used-phones",
    description: "Har phone check karke, battery health ke saath. PTA aur Non-PTA dono.",
    sort_order: 2,
    show_on_home: true,
    is_visible: true,
  },
  {
    id: "cat-acc",
    shop_id: SHOP_ID,
    name: "Accessories",
    slug: "accessories",
    description: "Chargers, covers, earbuds aur power banks.",
    sort_order: 3,
    show_on_home: true,
    is_visible: true,
  },
];

type ProductSeed = Partial<Product> &
  Pick<Product, "category_id" | "brand" | "model_name" | "slug">;

function product(seed: ProductSeed, index: number): Product {
  return {
    id: `prd-${seed.slug}`,
    shop_id: SHOP_ID,
    condition: "new",
    condition_rating: null,
    battery_health: null,
    repair_history: null,
    description: null,
    has_box: true,
    box_contents: [],
    warranty: null,
    colors: [],
    features: [],
    specs: [],
    tiktok_video_url: null,
    is_featured: false,
    is_visible: true,
    show_reviews: true,
    seo_title: null,
    seo_description: null,
    // Later entries are "newer" so "Naye pehle" sort has a stable order.
    created_at: new Date(Date.UTC(2026, 9, 1, 0, index)).toISOString(),
    ...seed,
  };
}

const newPhone = { condition: "new" as const, box_contents: ["cable", "charger"], warranty: "1 saal official warranty", description: "Box pack, official PTA approved." };
const usedPhone = { condition: "used" as const, warranty: "[7 din shop check warranty]" };

export const products: Product[] = [
  { category_id: "cat-new", brand: "Samsung", model_name: "Samsung Galaxy A55 5G", slug: "samsung-galaxy-a55-5g", ...newPhone, is_featured: true },
  { category_id: "cat-new", brand: "Infinix", model_name: "Infinix Note 40", slug: "infinix-note-40", ...newPhone },
  { category_id: "cat-new", brand: "Tecno", model_name: "Tecno Spark 30", slug: "tecno-spark-30", ...newPhone },
  { category_id: "cat-new", brand: "Xiaomi", model_name: "Redmi Note 14", slug: "redmi-note-14", ...newPhone },
  {
    category_id: "cat-used",
    brand: "Apple",
    model_name: "iPhone 13",
    slug: "iphone-13-used",
    ...usedPhone,
    condition_rating: "10/10",
    battery_health: 87,
    box_contents: ["cable", "bill"],
    repair_history: "Koi repair nahi",
    description: "Used 10/10 condition, koi scratch nahi. Face ID aur True Tone working. Battery health 87%.",
    is_featured: true,
    tiktok_video_url: "https://www.tiktok.com/",
    colors: [
      { name: "Midnight", hex: "#1F2937" },
      { name: "Starlight", hex: "#F5F0E6" },
      { name: "Blue", hex: "#2F5D8A" },
    ],
    features: [
      { title: '6.1" Super Retina XDR display', detail: "OLED screen, dhoop mein bhi saaf" },
      { title: "A15 Bionic chip", detail: "Games aur apps mein fast performance" },
      { title: "Dual 12MP camera", detail: "Night mode aur Cinematic video" },
      { title: "5G support", detail: "Future ke networks ke liye tayyar" },
      { title: "Face ID", detail: "Fully working, tested" },
    ],
    specs: [
      { key: "Display", value: "6.1 inch OLED" },
      { key: "Processor", value: "A15 Bionic" },
      { key: "Camera", value: "12MP + 12MP, 12MP front" },
      { key: "Battery health", value: "87%" },
      { key: "Condition", value: "Used 10/10, koi scratch nahi" },
      { key: "Box", value: "With box (original)" },
    ],
  },
  { category_id: "cat-used", brand: "Apple", model_name: "iPhone 12 Pro", slug: "iphone-12-pro-used", ...usedPhone, condition_rating: "9/10", battery_health: 82, box_contents: ["cable"], is_featured: true },
  { category_id: "cat-used", brand: "Apple", model_name: "iPhone 11", slug: "iphone-11-used", ...usedPhone, condition_rating: "8/10", battery_health: 79, has_box: false },
  { category_id: "cat-used", brand: "Apple", model_name: "iPhone XS Max", slug: "iphone-xs-max-used", ...usedPhone, condition_rating: "9/10", battery_health: 85, has_box: false },
  { category_id: "cat-used", brand: "Samsung", model_name: "Galaxy S22 Ultra", slug: "galaxy-s22-ultra-used", ...usedPhone, condition_rating: "9/10", box_contents: ["cable"], is_featured: true },
  { category_id: "cat-used", brand: "Samsung", model_name: "Galaxy S21 FE", slug: "galaxy-s21-fe-used", ...usedPhone, condition_rating: "10/10", box_contents: ["cable"] },
  { category_id: "cat-used", brand: "Google", model_name: "Google Pixel 7", slug: "google-pixel-7-used", ...usedPhone, condition_rating: "10/10", has_box: false, is_featured: true },
  { category_id: "cat-used", brand: "Google", model_name: "Google Pixel 6a", slug: "google-pixel-6a-used", ...usedPhone, condition_rating: "9/10", has_box: false },
  { category_id: "cat-acc", brand: null, model_name: "25W Fast Charger", slug: "25w-fast-charger", warranty: "1 saal warranty", description: "Type-C · 1 saal warranty", is_featured: true },
  { category_id: "cat-acc", brand: null, model_name: "Wireless Earbuds", slug: "wireless-earbuds", description: "ANC · 30 ghante battery" },
  { category_id: "cat-acc", brand: "Apple", model_name: "iPhone 13 Silicone Cover", slug: "iphone-13-silicone-cover", has_box: false, description: "6 colors" },
  { category_id: "cat-acc", brand: null, model_name: "10,000mAh Power Bank", slug: "10000mah-power-bank", description: "20W fast charging" },
].map(product);

type VariantSeed = [slug: string, storage: string | null, ram: string | null, pta: PtaStatus, price: number];

const variantSeeds: VariantSeed[] = [
  ["samsung-galaxy-a55-5g", "256GB", "8GB", "pta", 124999],
  ["infinix-note-40", "256GB", "8GB", "pta", 54999],
  ["tecno-spark-30", "128GB", "8GB", "pta", 39999],
  ["redmi-note-14", "256GB", "8GB", "pta", 59999],
  ["iphone-13-used", "128GB", null, "pta", 148000],
  ["iphone-13-used", "128GB", null, "non_pta", 98000],
  ["iphone-13-used", "256GB", null, "pta", 165000],
  ["iphone-13-used", "256GB", null, "non_pta", 112000],
  ["iphone-12-pro-used", "256GB", null, "non_pta", 95000],
  ["iphone-11-used", "64GB", null, "pta", 72000],
  ["iphone-xs-max-used", "256GB", null, "non_pta", 48000],
  ["galaxy-s22-ultra-used", "256GB", "12GB", "pta", 120000],
  ["galaxy-s21-fe-used", "128GB", "8GB", "pta", 58000],
  ["google-pixel-7-used", "128GB", "8GB", "non_pta", 62000],
  ["google-pixel-6a-used", "128GB", "6GB", "non_pta", 38000],
  ["25w-fast-charger", null, null, "na", 3500],
  ["wireless-earbuds", null, null, "na", 2800],
  ["iphone-13-silicone-cover", null, null, "na", 1200],
  ["10000mah-power-bank", null, null, "na", 4500],
];

export const variants: ProductVariant[] = variantSeeds.map(([slug, storage, ram, pta, price], i) => ({
  id: `var-${slug}-${i}`,
  shop_id: SHOP_ID,
  product_id: `prd-${slug}`,
  storage,
  ram,
  pta_status: pta,
  price,
  sale_price: null,
  in_stock: true,
  sort_order: i,
}));

// No photos in the demo; the UI shows phone-outline placeholders instead.
export const images: ProductImage[] = [];

type ReviewSeed = Partial<Review> & Pick<Review, "type">;

export const reviews: Review[] = (
  [
    { type: "text", location: "Gulshan", product_label: "iPhone 13", text: "Used iPhone liya tha, bilkul waisa hi nikla jaisa TikTok video mein dikhaya. Battery health bhi same thi." },
    { type: "text", location: "Hyderabad", product_label: "Galaxy A55", text: "WhatsApp par order kiya, agle din COD par phone aa gaya. Box pack tha." },
    { type: "text", location: "Saddar", product_label: "Pixel 7", text: "Dukaan par jaa kar check kiya, purana phone exchange mein diya aur achha rate mila." },
    { type: "text", product_id: "prd-iphone-13-used", location: "Gulshan", product_label: "iPhone 13", text: "Phone bilkul waisa hi tha jaisa video mein dikhaya. Battery health bhi same nikli." },
    { type: "text", product_id: "prd-iphone-13-used", location: "Hyderabad", product_label: "iPhone 13", text: "WhatsApp par baat ki, agle din COD par mil gaya. Packing achhi thi." },
    { type: "video", product_label: "iPhone 13 · Used", tiktok_url: "https://www.tiktok.com/" },
    { type: "video", product_label: "Galaxy A55 · New", tiktok_url: "https://www.tiktok.com/" },
    { type: "video", product_label: "Pixel 7 · Exchange", tiktok_url: "https://www.tiktok.com/" },
    { type: "video", product_label: "iPhone 12 Pro · Used", tiktok_url: "https://www.tiktok.com/" },
  ] satisfies ReviewSeed[]
).map((r, i) => ({
  id: `rev-${i}`,
  shop_id: SHOP_ID,
  product_id: null,
  customer_name: "[Customer naam]",
  location: null,
  text: null,
  rating: 5,
  tiktok_url: null,
  is_visible: true,
  sort_order: i,
  created_at: "2026-10-01T00:00:00Z",
  ...r,
}));
