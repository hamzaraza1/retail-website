import Link from "next/link";
import { whatsappLink } from "@/lib/whatsapp";
import type { Category, Shop } from "@/lib/supabase/types";

const BRAND = "Shop Builder";

export function ShopFooter({ shop, categories }: { shop: Shop; categories?: Category[] }) {
  const year = new Date().getFullYear();
  const bottom = (
    <div className="flex flex-wrap justify-between gap-3 text-[13px] text-muted">
      <span>
        © {year} {shop.name}
        {!categories && shop.address ? ` · ${shop.address.replace(/\n/g, ", ")}` : ""}
      </span>
      <span>Powered by {BRAND}</span>
    </div>
  );

  if (!categories) {
    return (
      <footer className="border-t border-line bg-[#FAFBFC]">
        <div className="mx-auto max-w-[1200px] px-4 py-6">{bottom}</div>
      </footer>
    );
  }

  const link = "flex min-h-11 items-center text-ink hover:text-accent sm:min-h-0";
  return (
    <footer className="border-t border-line bg-[#FAFBFC]">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-7 px-4 pt-10 pb-6">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
          <div className="col-span-2 flex flex-col gap-2 sm:col-span-1">
            <span className="font-display text-xl font-extrabold">{shop.name}</span>
            {shop.footer_about && <p className="m-0 text-sm leading-relaxed text-muted">{shop.footer_about}</p>}
          </div>
          <nav aria-label="Categories" className="flex flex-col gap-1 text-sm sm:gap-2">
            <span className="font-bold">Categories</span>
            {categories.map((c) => (
              <Link key={c.id} href={`/c/${c.slug}`} className={link}>
                {c.name}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-1 text-sm sm:gap-2">
            <span className="font-bold">Contact</span>
            <a href={whatsappLink(shop.whatsapp_number)} className={link}>
              WhatsApp
            </a>
            {shop.phone && (
              <a href={`tel:${shop.phone}`} className={link}>
                Call: {shop.phone}
              </a>
            )}
            {shop.tiktok_url && (
              <a href={shop.tiktok_url} target="_blank" rel="noopener noreferrer" className={link}>
                TikTok
              </a>
            )}
            {shop.instagram_url && (
              <a href={shop.instagram_url} target="_blank" rel="noopener noreferrer" className={link}>
                Instagram
              </a>
            )}
          </div>
          <div className="col-span-2 flex flex-col gap-2 text-sm sm:col-span-1">
            <span className="font-bold">Policy</span>
            {[shop.delivery_policy, shop.return_policy].filter(Boolean).map((t) => (
              <p key={t} className="m-0 leading-relaxed text-muted">
                {t}
              </p>
            ))}
          </div>
        </div>
        <div className="border-t border-line pt-4">{bottom}</div>
      </div>
    </footer>
  );
}
