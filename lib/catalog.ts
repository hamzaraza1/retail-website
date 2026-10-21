// Display helpers for products. Safe to use from server and client components.

import type { Json, Product, ProductVariant, PtaStatus, Shop } from "@/lib/supabase/types";

export type Color = { name: string; hex: string };
export type Feature = { title: string; detail?: string };
export type Spec = { key: string; value: string };
export type TrustItem = { title: string; detail: string };

function list<T>(value: Json | null | undefined, isItem: (x: Record<string, Json>) => boolean): T[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (x): x is Record<string, Json> =>
      typeof x === "object" && x !== null && !Array.isArray(x) && isItem(x),
  ) as unknown as T[];
}

export const productColors = (p: Product) =>
  list<Color>(p.colors, (x) => typeof x.name === "string" && typeof x.hex === "string");
export const productFeatures = (p: Product) =>
  list<Feature>(p.features, (x) => typeof x.title === "string");
export const productSpecs = (p: Product) =>
  list<Spec>(p.specs, (x) => typeof x.key === "string" && typeof x.value === "string");
export const shopTrustItems = (s: Shop) =>
  list<TrustItem>(s.trust_items, (x) => typeof x.title === "string");

export const effectivePrice = (v: ProductVariant) => v.sale_price ?? v.price;

/**
 * The variant a card or page shows first: lowest sort_order that is in stock
 * (optionally limited to a PTA status), else the first one. Expects variants sorted.
 */
export function defaultVariant(
  variants: ProductVariant[],
  pta?: PtaStatus,
): ProductVariant | undefined {
  const pool = pta ? variants.filter((v) => v.pta_status === pta) : variants;
  return pool.find((v) => v.in_stock) ?? pool[0];
}

export const PTA_SHORT: Record<PtaStatus, string> = { pta: "PTA", non_pta: "Non-PTA", na: "" };
export const PTA_LONG: Record<PtaStatus, string> = {
  pta: "PTA Approved",
  non_pta: "Non-PTA",
  na: "",
};

/** "Used 10/10", "New", "Open box". */
export function conditionLabel(p: Product): string {
  if (p.condition === "used") return p.condition_rating ? `Used ${p.condition_rating}` : "Used";
  if (p.condition === "open_box") return "Open box";
  return "New";
}

/** "8GB / 256GB" or "128GB"; empty for accessories. */
export function memoryLabel(v: ProductVariant | undefined): string {
  if (!v?.storage) return "";
  return v.ram ? `${v.ram} / ${v.storage}` : v.storage;
}

/** Second line on product cards, e.g. "128GB · Battery 87%" or "8GB / 256GB · Official". */
export function cardSubtitle(p: Product, v: ProductVariant | undefined): string {
  const memory = memoryLabel(v);
  if (!memory) return p.description ?? "";
  if (p.condition === "used" && p.battery_health) return `${memory} · Battery ${p.battery_health}%`;
  if (p.condition === "new" && v?.pta_status === "pta") return `${memory} · Official`;
  return memory;
}

export const BOX_ITEMS: { id: string; label: string }[] = [
  { id: "cable", label: "Cable" },
  { id: "charger", label: "Charger" },
  { id: "cover", label: "Cover" },
  { id: "bill", label: "Bill" },
];

/** Extracts the numeric video id from a TikTok URL, e.g. …/video/7301234567890123456. */
export function tiktokVideoId(url: string | null | undefined): string | null {
  return url?.match(/\/video\/(\d+)/)?.[1] ?? null;
}
