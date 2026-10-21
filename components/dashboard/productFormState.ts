// Editable shape of the product form, shared by the server pages and the client form.

import type { ProductFull } from "@/lib/data";
import { productFeatures, productSpecs, type Color } from "@/lib/catalog";
import { EMPTY_PHONE_SPECS } from "@/lib/spec-templates";
import type { Condition, PtaStatus } from "@/lib/supabase/types";

type VariantState = {
  id?: string;
  storage: string;
  ram: string;
  pta_status: PtaStatus;
  price: string;
  sale_price: string;
  in_stock: boolean;
};

export type ProductFormState = {
  id?: string;
  category_id: string;
  brand: string;
  model_name: string;
  slug: string;
  condition: Condition;
  condition_rating: string;
  battery_health: string;
  repair_history: string;
  description: string;
  has_box: boolean;
  box_contents: string[];
  warranty: string;
  colors: Color[];
  features: { title: string; detail: string }[];
  specs: { key: string; value: string }[];
  tiktok_video_url: string;
  is_featured: boolean;
  is_visible: boolean;
  show_reviews: boolean;
  seo_title: string;
  seo_description: string;
  images: { url: string; label: string }[];
  variants: VariantState[];
};

export const emptyProduct = (categoryId = ""): ProductFormState => ({
  category_id: categoryId,
  brand: "",
  model_name: "",
  slug: "",
  condition: "used",
  condition_rating: "10/10",
  battery_health: "",
  repair_history: "",
  description: "",
  has_box: true,
  box_contents: ["cable"],
  warranty: "7 din shop check warranty",
  colors: [],
  features: [],
  specs: EMPTY_PHONE_SPECS.map(([key, value]) => ({ key, value })),
  tiktok_video_url: "",
  is_featured: false,
  is_visible: true,
  show_reviews: true,
  seo_title: "",
  seo_description: "",
  images: [],
  variants: [{ storage: "128GB", ram: "", pta_status: "pta", price: "", sale_price: "", in_stock: true }],
});


/** Stored product → editable form state (numbers become text inputs). */
export function toFormState(p: ProductFull): ProductFormState {
  return {
    id: p.id,
    category_id: p.category_id ?? "",
    brand: p.brand ?? "",
    model_name: p.model_name,
    slug: p.slug,
    condition: p.condition ?? "new",
    condition_rating: p.condition_rating ?? "10/10",
    battery_health: p.battery_health?.toString() ?? "",
    repair_history: p.repair_history ?? "",
    description: p.description ?? "",
    has_box: !!p.has_box,
    box_contents: p.box_contents ?? [],
    warranty: p.warranty ?? "",
    colors: (Array.isArray(p.colors) ? p.colors : []) as Color[],
    features: productFeatures(p).map((x) => ({ title: x.title, detail: x.detail ?? "" })),
    specs: productSpecs(p),
    tiktok_video_url: p.tiktok_video_url ?? "",
    is_featured: !!p.is_featured,
    is_visible: !!p.is_visible,
    show_reviews: p.show_reviews ?? true,
    seo_title: p.seo_title ?? "",
    seo_description: p.seo_description ?? "",
    images: p.images.map((i) => ({ url: i.url, label: i.label ?? "" })),
    variants: p.variants.map((v) => ({
      id: v.id,
      storage: v.storage ?? "",
      ram: v.ram ?? "",
      pta_status: v.pta_status ?? "na",
      price: v.price.toLocaleString("en-PK"),
      sale_price: v.sale_price?.toLocaleString("en-PK") ?? "",
      in_stock: v.in_stock ?? true,
    })),
  };
}
