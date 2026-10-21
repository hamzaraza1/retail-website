// Storefront read API. Every page reads data only through these functions, so swapping the
// demo source for a real database later touches this file alone.
//
// Today: reads the in-memory demo shop (lib/data/demo.ts).

import "server-only";
import { cache } from "react";
import type {
  Category,
  Product,
  ProductImage,
  ProductVariant,
  PtaStatus,
  Review,
  Shop,
} from "@/lib/supabase/types";
import { conditionLabel, defaultVariant, effectivePrice, specValue } from "@/lib/catalog";
import * as demo from "./demo";

export type ProductFull = Product & {
  category: Category | null;
  images: ProductImage[];
  variants: ProductVariant[];
};

export type SortKey = "newest" | "price_asc" | "price_desc";

export type ProductFilters = {
  categoryId?: string;
  brand?: string;
  pta?: Exclude<PtaStatus, "na">;
  q?: string;
  sort?: SortKey;
};

const bySort = (a: { sort_order: number | null }, b: { sort_order: number | null }) =>
  (a.sort_order ?? 0) - (b.sort_order ?? 0);

function full(p: Product): ProductFull {
  return {
    ...p,
    category: demo.categories.find((c) => c.id === p.category_id) ?? null,
    images: demo.images.filter((i) => i.product_id === p.id).sort(bySort),
    variants: demo.variants.filter((v) => v.product_id === p.id).sort(bySort),
  };
}

function visibleProducts(shopId: string): Product[] {
  return demo.products.filter((p) => p.shop_id === shopId && p.is_visible);
}

// cache(): layout, generateMetadata and page share one lookup per request.
export const getShop = cache(async (slug: string): Promise<Shop | null> => {
  return demo.shops.find((s) => s.slug === slug && s.is_active) ?? null;
});

export async function getCategories(shopId: string): Promise<Category[]> {
  return demo.categories.filter((c) => c.shop_id === shopId && c.is_visible).sort(bySort);
}

export async function getCategory(shopId: string, slug: string): Promise<Category | null> {
  return (await getCategories(shopId)).find((c) => c.slug === slug) ?? null;
}

export async function listProducts(
  shopId: string,
  { categoryId, brand, pta, q, sort = "newest" }: ProductFilters = {},
): Promise<ProductFull[]> {
  const needle = q?.trim().toLowerCase();
  const list = visibleProducts(shopId)
    .filter((p) => !categoryId || p.category_id === categoryId)
    .filter((p) => !brand || p.brand?.toLowerCase() === brand.toLowerCase())
    .filter(
      (p) =>
        !needle ||
        p.model_name.toLowerCase().includes(needle) ||
        (p.brand?.toLowerCase().includes(needle) ?? false),
    )
    .map(full)
    .filter((p) => !pta || p.variants.some((v) => v.pta_status === pta));

  const price = (p: ProductFull) => {
    const v = defaultVariant(p.variants, pta);
    return v ? effectivePrice(v) : 0;
  };
  const created = (p: ProductFull) => p.created_at ?? "";

  return list.sort((a, b) => {
    if (sort === "price_asc") return price(a) - price(b);
    if (sort === "price_desc") return price(b) - price(a);
    return created(b).localeCompare(created(a));
  });
}

/** Home tabs: categories marked show_on_home, each with up to `limit` products, featured first. */
export async function getHomeTabs(shopId: string, limit = 4) {
  const cats = (await getCategories(shopId)).filter((c) => c.show_on_home);
  return Promise.all(
    cats.map(async (category) => {
      const items = await listProducts(shopId, { categoryId: category.id });
      const sorted = [...items].sort(
        (a, b) => Number(b.is_featured ?? false) - Number(a.is_featured ?? false),
      );
      return { category, products: sorted.slice(0, limit), total: items.length };
    }),
  );
}

/** Distinct brands of visible products, most common first. */
export async function getBrands(shopId: string, categoryId?: string): Promise<string[]> {
  const counts = new Map<string, number>();
  for (const p of visibleProducts(shopId)) {
    if (!p.brand || (categoryId && p.category_id !== categoryId)) continue;
    counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([brand]) => brand);
}

export async function getProduct(shopId: string, slug: string): Promise<ProductFull | null> {
  const p = visibleProducts(shopId).find((x) => x.slug === slug);
  return p ? full(p) : null;
}

export async function getRelated(product: ProductFull, limit = 4): Promise<ProductFull[]> {
  const others = visibleProducts(product.shop_id).filter((p) => p.id !== product.id);
  const same = others.filter((p) => p.category_id === product.category_id);
  const rest = others.filter((p) => p.category_id !== product.category_id && p.is_featured);
  return [...same, ...rest].slice(0, limit).map(full);
}

export async function getReviews(
  shopId: string,
  { type, productId }: { type: Review["type"]; productId?: string },
): Promise<Review[]> {
  const all = demo.reviews
    .filter((r) => r.shop_id === shopId && r.is_visible && r.type === type)
    .sort(bySort);
  if (productId) {
    const forProduct = all.filter((r) => r.product_id === productId);
    if (forProduct.length) return forProduct;
  }
  return all.filter((r) => r.product_id === null);
}

/** Resolves an order click to trusted product/variant data (never trust prices from the client). */
export async function getOrderTarget(shopSlug: string, productId: string, variantId?: string) {
  const shop = await getShop(shopSlug);
  if (!shop) return null;
  const product = visibleProducts(shop.id).find((p) => p.id === productId);
  if (!product) return null;
  const variant = variantId
    ? demo.variants.find((v) => v.id === variantId && v.product_id === product.id)
    : undefined;
  if (variantId && !variant) return null;
  return { shop, product, variant };
}

/**
 * Records a pending order + whatsapp_click event.
 * Demo mode has no database, so it only logs. With Supabase this becomes two inserts
 * through the service-role client (orders, events).
 */
export async function recordOrderClick(entry: {
  shopId: string;
  productId: string;
  variantId: string | null;
  snapshot: Record<string, unknown>;
  referrer: string | null;
}): Promise<void> {
  console.info("[order-click]", JSON.stringify(entry));
}

export async function listAllProductSlugs(shopId: string) {
  return visibleProducts(shopId).map((p) => ({ slug: p.slug, created_at: p.created_at }));
}

export type FinderPhone = {
  id: string;
  slug: string;
  name: string;
  condition: string;
  /** In-stock price points, cheapest first. A phone fits a budget if any option does. */
  options: { price: number; pta: PtaStatus; memory: string }[];
  batteryHealth: number | null;
  specs: { processor: string | null; battery: string | null; display: string | null; camera: string | null };
};

/** In-stock phones (products with storage variants) for the home budget finder + compare. */
export async function getFinderPhones(shopId: string): Promise<FinderPhone[]> {
  const out: FinderPhone[] = [];
  for (const p of (await listProducts(shopId)).filter((x) => x.variants.some((v) => v.storage))) {
    const stock = p.variants.filter((v) => v.in_stock);
    if (!stock.length) continue;
    out.push({
      id: p.id,
      slug: p.slug,
      name: p.model_name,
      condition: conditionLabel(p),
      options: stock
        .map((v) => ({
          price: effectivePrice(v),
          pta: v.pta_status ?? "na",
          memory: v.ram ? `${v.ram} / ${v.storage}` : (v.storage ?? ""),
        }))
        .sort((a, b) => a.price - b.price),
      batteryHealth: p.condition === "used" ? p.battery_health : null,
      specs: {
        processor: specValue(p, "Processor"),
        battery: specValue(p, "Battery"),
        display: specValue(p, "Display"),
        camera: specValue(p, "Main camera"),
      },
    });
  }
  return out;
}
