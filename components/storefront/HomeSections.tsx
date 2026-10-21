import Image from "next/image";
import Link from "next/link";
import { shopTrustItems } from "@/lib/catalog";
import type { Shop } from "@/lib/supabase/types";
import {
  CardIcon,
  ClockIcon,
  ExchangeIcon,
  PinIcon,
  ShieldIcon,
  TruckIcon,
} from "@/components/ui/icons";
import { PhonePlaceholder } from "./PhonePlaceholder";

const lines = (text: string) =>
  text.split("\n").map((line, i, all) => (
    <span key={i}>
      {line}
      {i < all.length - 1 && <br />}
    </span>
  ));

export function Hero({ shop }: { shop: Shop }) {
  return (
    <section className="mx-auto max-w-[1200px] p-4">
      <div className="flex flex-wrap overflow-hidden rounded-card-lg bg-ink text-white sm:min-h-[400px]">
        <div className="flex flex-[1_1_420px] flex-col justify-center gap-4.5 px-5 py-9 sm:px-8 sm:py-12">
          <span className="self-start rounded-full bg-slate-800 px-3 py-1.5 text-[13px] font-bold text-[#BFD3FF]">
            Har phone check karke diya jata hai
          </span>
          <h1 className="m-0 font-display text-[38px] leading-[1.02] font-extrabold tracking-tight sm:text-[52px]">
            {lines(shop.hero_title ?? shop.name)}
          </h1>
          {shop.hero_description && (
            <p className="m-0 max-w-[460px] text-base leading-relaxed text-[#C7CEDA] sm:text-lg">
              {shop.hero_description}
            </p>
          )}
          <div className="flex flex-wrap gap-2.5">
            <a href="#products" className="flex h-[50px] items-center rounded-full bg-white px-5.5 font-bold text-ink">
              Phones dekhein
            </a>
            <a
              href="#visit"
              className="flex h-[50px] items-center gap-2 rounded-full border border-[#3B4658] px-5.5 font-bold text-white"
            >
              <PinIcon />
              Dukaan ka pata
            </a>
          </div>
        </div>
        <div className="relative hidden min-h-[320px] flex-[1_1_380px] items-center justify-center bg-slate-800 sm:flex">
          {shop.banner_url ? (
            <Image src={shop.banner_url} alt="" fill sizes="50vw" priority className="object-cover" />
          ) : (
            <div className="flex w-full items-end justify-center gap-4 px-8" aria-hidden="true">
              <PhonePlaceholder className="w-[22%] border-slate-600 bg-slate-700" />
              <PhonePlaceholder className="w-[26%] border-slate-500 bg-slate-600" />
              <PhonePlaceholder className="w-[22%] border-slate-600 bg-slate-700" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function BrandPills({ brands }: { brands: string[] }) {
  if (!brands.length) return null;
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-2" aria-label="Brands">
      <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <span className="mr-1 shrink-0 text-sm font-bold text-muted">Brands:</span>
        {brands.map((b) => (
          <Link
            key={b}
            href={`/products?brand=${encodeURIComponent(b.toLowerCase())}`}
            className="flex h-11 shrink-0 items-center rounded-full border border-line px-4 text-sm font-medium text-ink hover:border-ink"
          >
            {b}
          </Link>
        ))}
      </div>
    </section>
  );
}

const TRUST_ICONS = [ShieldIcon, CardIcon, TruckIcon, ExchangeIcon];

export function TrustStrip({ shop }: { shop: Shop }) {
  const items = shopTrustItems(shop);
  if (!items.length) return null;
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-8">
      <ul className="grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
        {items.map((item, i) => {
          const Icon = TRUST_ICONS[i % TRUST_ICONS.length];
          return (
            <li key={item.title} className="flex items-start gap-3.5 rounded-card bg-soft p-5">
              <Icon size={24} className="shrink-0" />
              <div className="flex flex-col gap-1">
                <span className="font-bold">{item.title}</span>
                <span className="text-sm leading-normal text-muted">{item.detail}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function VisitShop({ shop }: { shop: Shop }) {
  const mapQuery = shop.address?.replace(/\n/g, ", ");
  return (
    <section id="visit" className="mx-auto max-w-[1200px] scroll-mt-4 px-4 pt-6 pb-12">
      <div className="flex flex-wrap overflow-hidden rounded-card-lg bg-soft">
        <div className="flex flex-[1_1_380px] flex-col gap-5 px-5 py-8 sm:px-8 sm:py-10">
          <h2 className="m-0 font-display text-[28px] leading-tight font-extrabold sm:text-[34px]">
            Dukaan par aa kar check karein
          </h2>
          {shop.address && (
            <div className="flex items-start gap-3">
              <PinIcon size={22} className="mt-0.5 shrink-0" />
              <p className="m-0 leading-normal text-slate-700">{lines(shop.address)}</p>
            </div>
          )}
          {shop.timings && (
            <div className="flex items-start gap-3">
              <ClockIcon size={22} className="mt-0.5 shrink-0" />
              <p className="m-0 leading-normal text-slate-700">{lines(shop.timings)}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-2.5">
            {shop.maps_url && (
              <a
                href={shop.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 items-center rounded-full bg-ink px-5 font-bold text-white"
              >
                Google Maps par dekhein
              </a>
            )}
            {shop.phone && (
              <a
                href={`tel:${shop.phone}`}
                className="flex h-12 items-center rounded-full border border-line-strong px-5 font-bold text-ink"
              >
                Call karein
              </a>
            )}
          </div>
        </div>
        {mapQuery && (
          <iframe
            title={`${shop.name} map`}
            src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="min-h-[280px] flex-[1_1_380px] border-0 bg-line"
          />
        )}
      </div>
    </section>
  );
}
