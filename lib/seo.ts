import { conditionLabel, defaultVariant, effectivePrice, PTA_SHORT } from "@/lib/catalog";
import type { ProductFull } from "@/lib/data";
import type { Shop } from "@/lib/supabase/types";

export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

/** Public origin of a shop's storefront, e.g. https://zaibmobiles.yourbrand.pk. */
export function shopOrigin(slug: string): string {
  const local = ROOT_DOMAIN.startsWith("localhost");
  return `${local ? "http" : "https"}://${slug}.${ROOT_DOMAIN}`;
}

/** Dashboard / login host, e.g. https://app.yourbrand.pk. */
export const appOrigin = () => shopOrigin("app");

export function productUrl(shopSlug: string, productSlug: string): string {
  return `${shopOrigin(shopSlug)}/p/${productSlug}`;
}

/** Fallback title from PLAN.md §4.5: "{model} {condition} {PTA} Price in Karachi | {shop}". */
export function productTitle(p: ProductFull, shop: Shop): string {
  if (p.seo_title) return p.seo_title;
  const v = defaultVariant(p.variants);
  const pta = v?.pta_status ? PTA_SHORT[v.pta_status] : "";
  const parts = [p.model_name, p.condition === "new" ? "" : conditionLabel(p).split(" ")[0], pta];
  return `${parts.filter(Boolean).join(" ")} Price in Karachi | ${shop.name}`;
}

export function productDescription(p: ProductFull, shop: Shop): string {
  if (p.seo_description) return p.seo_description;
  if (p.description) return p.description;
  const v = defaultVariant(p.variants);
  const price = v ? ` Rs. ${effectivePrice(v).toLocaleString("en-PK")}.` : "";
  return `${p.model_name} — ${conditionLabel(p)}.${price} WhatsApp par order karein, ${shop.name}.`;
}

const CONDITION_SCHEMA = {
  new: "https://schema.org/NewCondition",
  open_box: "https://schema.org/NewCondition",
  used: "https://schema.org/UsedCondition",
} as const;

/** JSON-LD Product schema with offers in PKR. */
export function productJsonLd(p: ProductFull, shop: Shop, url: string, image: string) {
  const prices = p.variants.map(effectivePrice);
  const inStock = p.variants.some((v) => v.in_stock);
  const availability = inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
  const itemCondition = CONDITION_SCHEMA[p.condition ?? "new"];
  const seller = { "@type": "Organization", name: shop.name };

  const offers =
    prices.length > 1
      ? {
          "@type": "AggregateOffer",
          priceCurrency: "PKR",
          lowPrice: Math.min(...prices),
          highPrice: Math.max(...prices),
          offerCount: prices.length,
          availability,
          itemCondition,
          seller,
          url,
        }
      : {
          "@type": "Offer",
          priceCurrency: "PKR",
          price: prices[0] ?? 0,
          availability,
          itemCondition,
          seller,
          url,
        };

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.model_name,
    description: productDescription(p, shop),
    image: [image],
    ...(p.brand ? { brand: { "@type": "Brand", name: p.brand } } : {}),
    offers,
  };
}
