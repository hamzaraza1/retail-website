import Image from "next/image";
import Link from "next/link";
import { whatsappLink } from "@/lib/whatsapp";
import type { Shop } from "@/lib/supabase/types";
import { ChevronLeftIcon, SearchIcon, WhatsAppIcon } from "@/components/ui/icons";

export function ShopLogo({ shop, size = 44 }: { shop: Shop; size?: number }) {
  if (shop.logo_url) {
    return (
      <Image src={shop.logo_url} alt="" width={size} height={size} className="rounded-xl object-cover" />
    );
  }
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: size * 0.45 }}
      className="flex shrink-0 items-center justify-center rounded-xl bg-accent font-display font-extrabold text-white"
    >
      {shop.name.charAt(0).toUpperCase()}
    </span>
  );
}

export function WhatsAppButton({ shop, className = "" }: { shop: Shop; className?: string }) {
  return (
    <a
      href={whatsappLink(shop.whatsapp_number)}
      className={`flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-whatsapp px-3.5 text-[15px] font-bold text-white hover:opacity-90 sm:gap-2 sm:px-4 ${className}`}
    >
      <WhatsAppIcon />
      WhatsApp
    </a>
  );
}

/**
 * - default: logo + name, WhatsApp button (category pages)
 * - search: adds tagline and search box (home)
 * - back: "‹ Category" link on the left, logo on the right (product page)
 */
export function ShopHeader({
  shop,
  search = false,
  back,
}: {
  shop: Shop;
  search?: boolean;
  back?: { href: string; label: string };
}) {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-4 py-3">
        {back && (
          <Link href={back.href} className="flex h-11 items-center gap-2 font-bold text-ink hover:text-accent">
            <ChevronLeftIcon size={20} />
            {back.label}
          </Link>
        )}
        <Link href="/" className="flex min-w-0 flex-1 basis-0 items-center gap-3 text-ink sm:flex-none sm:basis-auto">
          <ShopLogo shop={shop} size={back ? 36 : 44} />
          <span className="flex min-w-0 flex-col">
            <span className={`font-display leading-tight font-extrabold ${back ? "text-lg" : "text-xl"}`}>
              {shop.name}
            </span>
            {search && shop.tagline && <span className="truncate text-[13px] text-muted">{shop.tagline}</span>}
          </span>
        </Link>
        {search && (
          <form
            action="/products"
            role="search"
            className="order-last flex h-11 w-full items-center gap-2 rounded-full bg-soft px-4 sm:order-none sm:w-auto sm:max-w-[420px] sm:flex-[1_1_260px]"
          >
            <SearchIcon className="shrink-0 text-muted" />
            <input
              type="search"
              name="q"
              aria-label="Phone dhoondein"
              placeholder="iPhone 13, Galaxy A55…"
              className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted"
            />
          </form>
        )}
        {!back && <WhatsAppButton shop={shop} />}
      </div>
    </header>
  );
}
