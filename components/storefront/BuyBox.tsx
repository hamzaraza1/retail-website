"use client";

import { useState } from "react";
import { defaultVariant, effectivePrice, PTA_LONG, PTA_SHORT, type Color } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { orderMessage, whatsappLink } from "@/lib/whatsapp";
import type { ProductVariant, PtaStatus } from "@/lib/supabase/types";
import { PhoneIcon, WhatsAppIcon } from "@/components/ui/icons";
import { Badge, PtaBadge } from "./Badge";

type Props = {
  shopSlug: string;
  whatsappNumber: string;
  phone: string | null;
  productId: string;
  name: string;
  eyebrow: string;
  hasBox: boolean;
  url: string;
  variants: ProductVariant[];
  colors: Color[];
};

const uniq = <T,>(xs: T[]) => [...new Set(xs)];

/**
 * Price, Storage + PTA pickers and the WhatsApp order button (PLAN.md §4.3–4.4).
 * Pickers with a single option are hidden; out-of-stock combinations are disabled.
 */
export function BuyBox(p: Props) {
  const first = defaultVariant(p.variants);
  const [storage, setStorage] = useState(first?.storage ?? null);
  const [pta, setPta] = useState<PtaStatus | null>(first?.pta_status ?? null);

  const storages = uniq(p.variants.map((v) => v.storage).filter((s): s is string => !!s));
  const ptas = uniq(p.variants.map((v) => v.pta_status).filter((s): s is PtaStatus => !!s && s !== "na"));

  const find = (s: string | null, t: PtaStatus | null) =>
    p.variants.find((v) => v.storage === s && v.pta_status === t);
  const available = (s: string | null, t: PtaStatus | null) => !!find(s, t)?.in_stock;

  const variant = find(storage, pta) ?? first;
  const inStock = !!variant?.in_stock;
  const price = variant ? effectivePrice(variant) : null;

  function pickStorage(s: string) {
    setStorage(s);
    // Keep the PTA choice if that combination exists, otherwise jump to one that is in stock.
    if (!available(s, pta)) {
      const alt = p.variants.find((v) => v.storage === s && v.in_stock) ?? p.variants.find((v) => v.storage === s);
      if (alt) setPta(alt.pta_status);
    }
  }

  const options = [variant?.storage, variant?.pta_status ? PTA_SHORT[variant.pta_status] : ""].filter(
    (x): x is string => !!x,
  );
  const message = price !== null ? orderMessage({ name: p.name, options, price, url: p.url }) : "";
  const waHref = whatsappLink(
    p.whatsappNumber,
    inStock ? message : `Assalam o Alaikum! ${p.name} (${options.join(", ")}) kab tak available hoga?`,
  );

  function trackClick() {
    // Fire-and-forget: never hold up the WhatsApp redirect.
    const body = JSON.stringify({
      shop: p.shopSlug,
      productId: p.productId,
      variantId: variant?.id,
      ref: document.referrer.slice(0, 500),
    });
    try {
      if (!navigator.sendBeacon?.("/api/order-click", new Blob([body], { type: "application/json" }))) {
        void fetch("/api/order-click", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } });
      }
    } catch {
      // Tracking must never break ordering.
    }
  }

  const pill = (on: boolean) =>
    `h-[46px] min-w-[88px] rounded-input border-[1.5px] px-4.5 text-[15px] font-bold disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through ${
      on ? "border-ink bg-ink text-white" : "border-line-strong bg-white text-ink hover:border-ink"
    }`;

  return (
    <div className="flex min-w-0 flex-col gap-5.5">
      <div className="flex flex-col gap-2.5">
        <p className="m-0 text-sm font-bold tracking-wide text-accent uppercase">{p.eyebrow}</p>
        <h1 className="m-0 font-display text-[34px] leading-[1.05] font-extrabold tracking-tight sm:text-[42px]">
          {p.name}
        </h1>
        <div className="flex flex-wrap items-center gap-2.5">
          {price !== null && (
            <span className="text-[30px] font-bold sm:text-[32px]" aria-live="polite">
              {formatPrice(price)}
            </span>
          )}
          {variant?.sale_price != null && variant.sale_price < variant.price && (
            <s className="text-lg text-muted">{formatPrice(variant.price)}</s>
          )}
          <PtaBadge status={variant?.pta_status ?? null} long pill />
          {storages.length > 0 && <Badge tone="info" pill>{p.hasBox ? "With box" : "Without box"}</Badge>}
          {inStock ? <Badge tone="pta" pill>In stock</Badge> : <Badge tone="nonpta" pill>Stock khatam</Badge>}
        </div>
      </div>

      {storages.length > 1 && (
        <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
          <legend className="mb-2.5 text-[15px] font-bold">Storage</legend>
          <div className="flex flex-wrap gap-2">
            {storages.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={storage === s}
                disabled={!p.variants.some((v) => v.storage === s && v.in_stock)}
                onClick={() => pickStorage(s)}
                className={pill(storage === s)}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {ptas.length > 1 && (
        <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
          <legend className="mb-2.5 text-[15px] font-bold">PTA status</legend>
          <div className="flex flex-wrap gap-2">
            {ptas.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={pta === t}
                disabled={!available(storage, t)}
                onClick={() => setPta(t)}
                className={pill(pta === t)}
              >
                {PTA_LONG[t]}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {p.colors.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <p className="m-0 text-[15px] font-bold">Available colors</p>
          <ul className="m-0 flex list-none flex-wrap items-center gap-3.5 p-0 text-sm">
            {p.colors.map((c) => (
              <li key={c.name} className="flex items-center gap-2">
                <span aria-hidden="true" className="h-5.5 w-5.5 rounded-full border border-line-strong" style={{ background: c.hex }} />
                {c.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        <a
          href={waHref}
          onClick={inStock ? trackClick : undefined}
          className="flex h-[58px] items-center justify-center gap-2.5 rounded-full bg-whatsapp text-lg font-bold text-white hover:opacity-90"
        >
          <WhatsAppIcon size={22} />
          {inStock ? "WhatsApp par Order karein" : "WhatsApp par poochein"}
        </a>
        {p.phone && (
          <a
            href={`tel:${p.phone}`}
            className="flex h-[52px] items-center justify-center gap-2.5 rounded-full border border-line-strong font-bold text-ink"
          >
            <PhoneIcon size={20} />
            Call karein
          </a>
        )}
        <p className="m-0 text-center text-[13px] text-muted">Color, delivery aur payment WhatsApp par tay hoga</p>
      </div>

      {inStock && message && (
        <div className="flex flex-col gap-2">
          <p className="m-0 text-[13px] font-bold tracking-wide text-muted uppercase">Shopkeeper ko yeh message jayega</p>
          <p className="m-0 max-w-[360px] self-start rounded-xl rounded-bl-sm bg-[#E6F4EA] px-3.5 py-3 text-sm leading-relaxed break-words whitespace-pre-line">
            {message}
          </p>
        </div>
      )}
    </div>
  );
}
