// Dashboard + admin writes. Every owner function takes the caller's shopId (from the session)
// and only touches rows of that shop — the same rule RLS enforces once Supabase is connected.

import "server-only";
import { slugify } from "@/lib/format";
import type { Category, Product, Shop } from "@/lib/supabase/types";
import {
  newShopSchema,
  productSchema,
  shopSettingsSchema,
  type ProductInput,
  type ShopSettingsInput,
} from "./schemas";
import { hashPassword, newId, store } from "./store";
import type { ProductFull } from "./index";
import { z } from "zod";

export type Result<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

const fail = (error: string) => ({ ok: false as const, error });
const FIELD_LABELS: Record<string, string> = {
  model_name: "Model name",
  slug: "URL",
  tiktok_video_url: "TikTok link",
  images: "Photos",
  name: "Shop ka naam",
  tiktok_url: "TikTok link",
  instagram_url: "Instagram link",
  maps_url: "Google Maps link",
  theme_color: "Theme color",
  owner_email: "Owner email",
  owner_password: "Password",
  plan_expires_at: "Expiry",
};

/** First validation problem as a short sentence a shopkeeper can act on. */
const firstIssue = (e: z.ZodError) => {
  const i = e.issues[0];
  const [field, index, sub] = i.path;
  if (field === "variants" && typeof index === "number") return `Variant ${index + 1}: ${i.message}`;
  if (field === "images" && typeof index === "number") return `Photo ${index + 1}: ${i.message}`;
  if ((field === "specs" || field === "features" || field === "trust_items") && typeof index === "number") {
    return `${field === "specs" ? "Spec" : field === "features" ? "Feature" : "Trust box"} ${index + 1} (${String(sub)}): ${i.message}`;
  }
  // Our schema messages are written for shopkeepers; zod's built-in English ones get the field name.
  const builtIn = /^(String|Number|Array|Invalid|Expected|Required)/.test(i.message);
  const label = FIELD_LABELS[String(field)] ?? String(field ?? "Form");
  return builtIn ? `${label}: ${i.message}` : i.message;
};

const bySort = (a: { sort_order: number | null }, b: { sort_order: number | null }) =>
  (a.sort_order ?? 0) - (b.sort_order ?? 0);

function ownProduct(shopId: string, id: string): Product | undefined {
  return store.products.find((p) => p.id === id && p.shop_id === shopId);
}

function uniqueSlug(shopId: string, base: string, exceptId?: string): string {
  const taken = new Set(store.products.filter((p) => p.shop_id === shopId && p.id !== exceptId).map((p) => p.slug));
  let slug = base || "product";
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
  return slug;
}

export function shopSlugOf(shopId: string): string | null {
  return store.shops.find((s) => s.id === shopId)?.slug ?? null;
}

// ---------------------------------------------------------------------------
// Reads for the dashboard (include hidden rows)
// ---------------------------------------------------------------------------

export function dashboardProducts(shopId: string): ProductFull[] {
  return store.products
    .filter((p) => p.shop_id === shopId)
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))
    .map((p) => ({
      ...p,
      category: store.categories.find((c) => c.id === p.category_id) ?? null,
      images: store.images.filter((i) => i.product_id === p.id).sort(bySort),
      variants: store.variants.filter((v) => v.product_id === p.id).sort(bySort),
    }));
}

export function dashboardProduct(shopId: string, id: string): ProductFull | null {
  return dashboardProducts(shopId).find((p) => p.id === id) ?? null;
}

export function dashboardCategories(shopId: string): Category[] {
  return store.categories.filter((c) => c.shop_id === shopId).sort(bySort);
}

export function shopById(shopId: string): Shop | null {
  return store.shops.find((s) => s.id === shopId) ?? null;
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export function saveProduct(shopId: string, raw: ProductInput): Result<{ id: string; slug: string }> {
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const input = parsed.data;

  const existing = input.id ? ownProduct(shopId, input.id) : undefined;
  if (input.id && !existing) return fail("Product nahi mila.");
  if (input.category_id && !store.categories.some((c) => c.id === input.category_id && c.shop_id === shopId)) {
    return fail("Category nahi mili.");
  }

  const id = existing?.id ?? newId("prd");
  const defaultPta = input.variants.find((v) => v.pta_status !== "na")?.pta_status;
  const autoSlug = slugify(
    [input.model_name, input.condition === "used" ? "used" : "", defaultPta === "pta" ? "pta" : defaultPta === "non_pta" ? "non-pta" : ""]
      .filter(Boolean)
      .join(" "),
  );
  const slug = uniqueSlug(shopId, input.slug || existing?.slug || autoSlug, id);
  const isUsed = input.condition === "used";

  const row: Product = {
    id,
    shop_id: shopId,
    category_id: input.category_id,
    brand: input.brand,
    model_name: input.model_name,
    slug,
    condition: input.condition,
    condition_rating: isUsed ? input.condition_rating : null,
    battery_health: isUsed ? input.battery_health : null,
    repair_history: isUsed ? input.repair_history : null,
    description: input.description,
    has_box: input.has_box,
    box_contents: input.box_contents,
    warranty: input.warranty,
    colors: input.colors,
    features: input.features.map((f) => ({ title: f.title, detail: f.detail })),
    specs: input.specs,
    tiktok_video_url: input.tiktok_video_url,
    is_featured: input.is_featured,
    is_visible: input.is_visible,
    show_reviews: input.show_reviews,
    seo_title: input.seo_title,
    seo_description: input.seo_description,
    created_at: existing?.created_at ?? new Date().toISOString(),
  };

  if (existing) Object.assign(existing, row);
  else store.products.push(row);

  store.images = store.images.filter((i) => i.product_id !== id);
  input.images.forEach((img, i) =>
    store.images.push({ id: newId("img"), shop_id: shopId, product_id: id, url: img.url, label: img.label, sort_order: i }),
  );
  store.variants = store.variants.filter((v) => v.product_id !== id);
  input.variants.forEach((v, i) =>
    store.variants.push({
      id: v.id && v.id.startsWith("var-") ? v.id : newId("var"),
      shop_id: shopId,
      product_id: id,
      storage: v.storage,
      ram: v.ram,
      pta_status: v.pta_status,
      price: v.price,
      sale_price: v.sale_price && v.sale_price < v.price ? v.sale_price : null,
      in_stock: v.in_stock,
      sort_order: i,
    }),
  );
  return { ok: true, data: { id, slug } };
}

export function setProductVisible(shopId: string, id: string, visible: boolean): Result {
  const p = ownProduct(shopId, id);
  if (!p) return fail("Product nahi mila.");
  p.is_visible = visible;
  return { ok: true, data: undefined };
}

/** Quick stock switch from the list: all variants in or out of stock. */
export function setProductStock(shopId: string, id: string, inStock: boolean): Result {
  if (!ownProduct(shopId, id)) return fail("Product nahi mila.");
  store.variants.filter((v) => v.product_id === id).forEach((v) => (v.in_stock = inStock));
  return { ok: true, data: undefined };
}

/** Copy as a hidden draft — handy for similar phones (PLAN.md §5.2). */
export function duplicateProduct(shopId: string, id: string): Result<{ id: string }> {
  const src = dashboardProduct(shopId, id);
  if (!src) return fail("Product nahi mila.");
  const res = saveProduct(shopId, {
    ...src,
    id: undefined,
    model_name: `${src.model_name} (copy)`,
    slug: "",
    condition: src.condition ?? "new",
    has_box: !!src.has_box,
    box_contents: src.box_contents ?? [],
    colors: (src.colors as { name: string; hex: string }[]) ?? [],
    features: ((src.features as { title: string; detail?: string }[]) ?? []).map((f) => ({ title: f.title, detail: f.detail ?? "" })),
    specs: (src.specs as { key: string; value: string }[]) ?? [],
    is_featured: false,
    is_visible: false,
    show_reviews: src.show_reviews ?? true,
    images: src.images.map((i) => ({ url: i.url, label: i.label })),
    variants: src.variants.map((v) => ({ ...v, id: undefined, pta_status: v.pta_status ?? "na", in_stock: v.in_stock ?? true })),
  });
  return res.ok ? { ok: true, data: { id: res.data.id } } : res;
}

export function deleteProduct(shopId: string, id: string): Result {
  if (!ownProduct(shopId, id)) return fail("Product nahi mila.");
  store.products = store.products.filter((p) => p.id !== id);
  store.images = store.images.filter((i) => i.product_id !== id);
  store.variants = store.variants.filter((v) => v.product_id !== id);
  store.reviews.filter((r) => r.product_id === id).forEach((r) => (r.product_id = null));
  return { ok: true, data: undefined };
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

const categoryName = z.string().trim().min(2, "Category ka naam likhein").max(40);

export function createCategory(shopId: string, name: string): Result<Category> {
  const parsed = categoryName.safeParse(name);
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const cats = dashboardCategories(shopId);
  const base = slugify(parsed.data) || "category";
  let slug = base;
  for (let n = 2; cats.some((c) => c.slug === slug); n++) slug = `${base}-${n}`;
  const row: Category = {
    id: newId("cat"),
    shop_id: shopId,
    name: parsed.data,
    slug,
    description: null,
    sort_order: (cats.at(-1)?.sort_order ?? 0) + 1,
    show_on_home: true,
    is_visible: true,
  };
  store.categories.push(row);
  return { ok: true, data: row };
}

export function updateCategory(
  shopId: string,
  id: string,
  patch: { name?: string; description?: string | null; show_on_home?: boolean; is_visible?: boolean },
): Result {
  const c = store.categories.find((x) => x.id === id && x.shop_id === shopId);
  if (!c) return fail("Category nahi mili.");
  if (patch.name !== undefined) {
    const parsed = categoryName.safeParse(patch.name);
    if (!parsed.success) return fail(parsed.error.issues[0].message);
    c.name = parsed.data; // slug stays, so shared links keep working
  }
  if (patch.description !== undefined) c.description = patch.description?.trim().slice(0, 200) || null;
  if (patch.show_on_home !== undefined) c.show_on_home = patch.show_on_home;
  if (patch.is_visible !== undefined) c.is_visible = patch.is_visible;
  return { ok: true, data: undefined };
}

export function moveCategory(shopId: string, id: string, dir: -1 | 1): Result {
  const cats = dashboardCategories(shopId);
  const i = cats.findIndex((c) => c.id === id);
  const j = i + dir;
  if (i < 0) return fail("Category nahi mili.");
  if (j < 0 || j >= cats.length) return { ok: true, data: undefined };
  [cats[i], cats[j]] = [cats[j], cats[i]];
  cats.forEach((c, k) => (c.sort_order = k + 1));
  return { ok: true, data: undefined };
}

export function deleteCategory(shopId: string, id: string): Result {
  const c = store.categories.find((x) => x.id === id && x.shop_id === shopId);
  if (!c) return fail("Category nahi mili.");
  store.categories = store.categories.filter((x) => x.id !== id);
  store.products.filter((p) => p.category_id === id).forEach((p) => (p.category_id = null));
  return { ok: true, data: undefined };
}

// ---------------------------------------------------------------------------
// Shop settings
// ---------------------------------------------------------------------------

export function updateShopSettings(shopId: string, raw: ShopSettingsInput): Result {
  const parsed = shopSettingsSchema.safeParse(raw);
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const shop = store.shops.find((s) => s.id === shopId);
  if (!shop) return fail("Shop nahi mili.");
  // Owner-editable fields only: slug, plan and active status stay admin-only.
  Object.assign(shop, parsed.data);
  return { ok: true, data: undefined };
}

export function changePassword(userId: string, password: string): Result {
  if (password.length < 8) return fail("Password kam az kam 8 characters ka ho.");
  const user = store.users.find((u) => u.id === userId);
  if (!user) return fail("User nahi mila.");
  user.passwordHash = hashPassword(password);
  return { ok: true, data: undefined };
}

// ---------------------------------------------------------------------------
// Super-admin
// ---------------------------------------------------------------------------

export function adminShops() {
  return store.shops.map((s) => ({
    shop: s,
    owner: store.users.find((u) => u.role === "owner" && u.shopId === s.id) ?? null,
    products: store.products.filter((p) => p.shop_id === s.id).length,
  }));
}

export function createShop(raw: z.input<typeof newShopSchema>): Result<{ slug: string }> {
  const parsed = newShopSchema.safeParse(raw);
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const input = parsed.data;
  if (store.shops.some((s) => s.slug === input.slug)) return fail("Yeh shop link pehle se kisi aur ka hai.");
  if (store.users.some((u) => u.email.toLowerCase() === input.owner_email)) return fail("Is email ka account pehle se hai.");

  const shopId = newId("shop");
  const ownerId = newId("user");
  store.shops.push({
    id: shopId,
    owner_id: ownerId,
    slug: input.slug,
    name: input.name,
    niche: "mobile",
    tagline: "New · Used · Accessories",
    hero_title: "Naya ho ya used,\nsahi phone, sahi price",
    hero_description: null,
    logo_url: null,
    banner_url: null,
    banner_mobile_url: null,
    theme_color: "#1D4ED8",
    whatsapp_number: input.whatsapp_number,
    phone: null,
    address: null,
    maps_url: null,
    timings: null,
    tiktok_url: null,
    instagram_url: null,
    footer_about: null,
    delivery_policy: null,
    return_policy: null,
    warranty_note: null,
    trust_items: [
      { title: "Checked phones", detail: "Har used phone ki battery aur parts check." },
      { title: "Cash on Delivery", detail: "Karachi mein delivery available." },
    ],
    seo_title: null,
    seo_description: null,
    plan: input.plan,
    plan_expires_at: new Date(`${input.plan_expires_at}T23:59:59+05:00`).toISOString(),
    is_active: true,
    created_at: new Date().toISOString(),
  });
  store.users.push({
    id: ownerId,
    email: input.owner_email,
    passwordHash: hashPassword(input.owner_password),
    role: "owner",
    shopId,
  });
  // Starter categories so the shopkeeper can add products right away.
  ["New Phones", "Used Phones", "Accessories"].forEach((name) => createCategory(shopId, name));
  return { ok: true, data: { slug: input.slug } };
}

export function setShopActive(shopId: string, active: boolean): Result {
  const s = store.shops.find((x) => x.id === shopId);
  if (!s) return fail("Shop nahi mili.");
  s.is_active = active;
  return { ok: true, data: undefined };
}

export function resetOwnerPassword(shopId: string, password: string): Result {
  const owner = store.users.find((u) => u.role === "owner" && u.shopId === shopId);
  if (!owner) return fail("Owner nahi mila.");
  return changePassword(owner.id, password);
}
