import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopFooter } from "@/components/storefront/ShopFooter";
import { ShopHeader } from "@/components/storefront/ShopHeader";
import { getCategories, getShop } from "@/lib/data";
import { shopOrigin } from "@/lib/seo";

type Params = Promise<{ shop: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const shop = await getShop((await params).shop);
  if (!shop) return {};
  const title = shop.seo_title ?? `${shop.name} — ${shop.tagline ?? "Karachi"}`;
  return {
    metadataBase: new URL(shopOrigin(shop.slug)),
    title,
    description: shop.seo_description ?? shop.hero_description ?? undefined,
    openGraph: { siteName: shop.name, locale: "en_PK", type: "website" },
  };
}

export default async function ShopLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const shop = await getShop((await params).shop);
  if (!shop) notFound();
  const categories = await getCategories(shop.id);

  // Same header and footer on every storefront page. Per-shop accent colour drives
  // buttons, links and highlights (--accent token).
  return (
    <div
      style={{ "--accent": shop.theme_color ?? "#1D4ED8" } as React.CSSProperties}
      className="flex min-h-dvh flex-col"
    >
      <ShopHeader shop={shop} />
      <div className="flex-1">{children}</div>
      <ShopFooter shop={shop} categories={categories} />
    </div>
  );
}
