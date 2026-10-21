import Link from "next/link";
import type { ProductFull, SortKey } from "@/lib/data";
import { whatsappLink } from "@/lib/whatsapp";
import type { PtaStatus, Shop } from "@/lib/supabase/types";
import { WhatsAppIcon } from "@/components/ui/icons";
import { ProductGrid } from "./ProductCard";
import { SortSelect } from "./SortSelect";

export type ListingParams = { brand?: string; pta?: Exclude<PtaStatus, "na">; sort?: SortKey; q?: string };

/** Builds a query string, dropping empty values and the default sort. */
function href(params: ListingParams) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v && !(k === "sort" && v === "newest")) qs.set(k, v);
  }
  const s = qs.toString();
  return s ? `?${s}` : "?";
}

function Pill({ on, to, children }: { on: boolean; to: string; children: React.ReactNode }) {
  return (
    <Link
      href={to}
      scroll={false}
      aria-pressed={on}
      className={`flex h-11 shrink-0 items-center rounded-full border px-4 text-sm font-bold ${
        on ? "border-ink bg-ink text-white" : "border-line-strong bg-white text-ink hover:border-ink"
      }`}
    >
      {children}
    </Link>
  );
}

function PillRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
      <span className="w-16 shrink-0 text-sm font-bold text-muted">{label}</span>
      {children}
    </div>
  );
}

/**
 * Title, sort, Brand + PTA filters and grid. Filters live in the URL so links are shareable.
 * No "All" pill: nothing selected = everything; tapping the active pill clears it.
 */
export function Listing({
  shop,
  title,
  description,
  breadcrumb,
  products,
  brands,
  showPta,
  params,
  unit,
}: {
  shop: Shop;
  title: string;
  description?: string | null;
  breadcrumb: string;
  products: ProductFull[];
  brands: string[];
  showPta: boolean;
  params: ListingParams;
  unit: string;
}) {
  const brandKey = params.brand?.toLowerCase();
  const ask = whatsappLink(
    shop.whatsapp_number,
    `Assalam o Alaikum! ${title} mein ${[params.brand, params.pta === "pta" ? "PTA" : params.pta === "non_pta" ? "Non-PTA" : ""].filter(Boolean).join(" ")} kuch available hai?`.replace(/\s+/g, " "),
  );

  return (
    <>
      <section className="mx-auto flex max-w-[1200px] flex-col gap-3.5 px-4 pt-6 pb-2">
        <nav aria-label="Breadcrumb" className="flex gap-2 text-sm text-muted">
          <Link href="/" className="text-ink underline-offset-2 hover:underline">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{breadcrumb}</span>
        </nav>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <h1 className="m-0 font-display text-[34px] leading-tight font-extrabold tracking-tight sm:text-[44px]">
              {title}
            </h1>
            {description && <p className="m-0 text-base text-muted">{description}</p>}
          </div>
          <SortSelect value={params.sort ?? "newest"} />
        </div>
      </section>

      {(brands.length > 1 || showPta) && (
        <section className="mx-auto flex max-w-[1200px] flex-col gap-3 px-4 py-3" aria-label="Filters">
          {brands.length > 1 && (
            <PillRow label="Brand">
              {brands.map((b) => {
                const on = brandKey === b.toLowerCase();
                return (
                  <Pill key={b} on={on} to={href({ ...params, brand: on ? undefined : b.toLowerCase() })}>
                    {b}
                  </Pill>
                );
              })}
            </PillRow>
          )}
          {showPta && (
            <PillRow label="PTA">
              {(
                [
                  ["pta", "PTA Approved"],
                  ["non_pta", "Non-PTA"],
                ] as const
              ).map(([id, label]) => {
                const on = params.pta === id;
                return (
                  <Pill key={id} on={on} to={href({ ...params, pta: on ? undefined : id })}>
                    {label}
                  </Pill>
                );
              })}
            </PillRow>
          )}
        </section>
      )}

      <section className="mx-auto flex max-w-[1200px] flex-col gap-4 px-4 pt-4 pb-12">
        <p className="m-0 text-sm text-muted" aria-live="polite">
          {products.length} {unit}
        </p>
        {products.length ? (
          <ProductGrid products={products} pta={params.pta} />
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-card bg-soft p-8 text-center text-slate-700">
            <p className="m-0">Is filter mein abhi koi phone nahi. WhatsApp par poochein, hum arrange kar denge.</p>
            <a href={ask} className="flex h-12 items-center gap-2 rounded-full bg-whatsapp px-5 font-bold text-white">
              <WhatsAppIcon />
              WhatsApp par poochein
            </a>
          </div>
        )}
      </section>
    </>
  );
}

const SORTS: SortKey[] = ["newest", "price_asc", "price_desc"];
const PTAS = ["pta", "non_pta"] as const;

/** Reads and validates listing params from the page's searchParams. */
export function parseListingParams(sp: Record<string, string | string[] | undefined>): ListingParams {
  const one = (k: string) => {
    const v = sp[k];
    return (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
  };
  const sort = one("sort") as SortKey | undefined;
  const pta = one("pta") as (typeof PTAS)[number] | undefined;
  return {
    brand: one("brand")?.toLowerCase(),
    pta: pta && PTAS.includes(pta) ? pta : undefined,
    sort: sort && SORTS.includes(sort) ? sort : undefined,
    q: one("q")?.slice(0, 80),
  };
}
