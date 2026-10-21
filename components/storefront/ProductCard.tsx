import Image from "next/image";
import Link from "next/link";
import { cardSubtitle, defaultVariant, effectivePrice } from "@/lib/catalog";
import type { ProductFull } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import type { PtaStatus } from "@/lib/supabase/types";
import { Badge, PtaBadge } from "./Badge";
import { PhonePlaceholder } from "./PhonePlaceholder";

export function ProductCard({ product, pta }: { product: ProductFull; pta?: PtaStatus }) {
  const variant = defaultVariant(product.variants, pta);
  const cover = product.images[0];
  const price = variant ? effectivePrice(variant) : null;
  const onSale = variant?.sale_price != null && variant.sale_price < variant.price;

  return (
    <Link href={`/p/${product.slug}`} className="group flex flex-col gap-2.5 text-ink no-underline">
      <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-card bg-soft">
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.label ? `${product.model_name} — ${cover.label}` : product.model_name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition-transform group-hover:scale-[1.02]"
          />
        ) : (
          <PhonePlaceholder />
        )}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          <PtaBadge status={variant?.pta_status ?? null} />
          {product.condition === "used" && product.condition_rating && (
            <Badge tone="white">{product.condition_rating}</Badge>
          )}
          {variant && !product.variants.some((v) => v.in_stock) && <Badge tone="white">Stock khatam</Badge>}
        </div>
      </div>
      <div className="flex flex-col gap-0.5">
        <h3 className="text-[15px] leading-snug font-bold group-hover:text-accent">{product.model_name}</h3>
        <p className="text-[13px] text-muted">{cardSubtitle(product, variant)}</p>
        {price !== null && (
          <p className="mt-0.5 flex items-baseline gap-2">
            <span className="text-[17px] font-bold">{formatPrice(price)}</span>
            {onSale && <s className="text-[13px] text-muted">{formatPrice(variant.price)}</s>}
          </p>
        )}
      </div>
    </Link>
  );
}

export function ProductGrid({ products, pta }: { products: ProductFull[]; pta?: PtaStatus }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-[repeat(auto-fill,minmax(170px,1fr))]">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} pta={pta} />
      ))}
    </div>
  );
}
