import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Listing, parseListingParams } from "@/components/storefront/Listing";
import { ShopFooter } from "@/components/storefront/ShopFooter";
import { ShopHeader } from "@/components/storefront/ShopHeader";
import { getBrands, getShop, listProducts } from "@/lib/data";

// All products across categories. Target of the header search box and the home brand pills.

type Props = {
  params: Promise<{ shop: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const shop = await getShop((await params).shop);
  if (!shop) return {};
  return {
    title: `Saare products | ${shop.name}`,
    alternates: { canonical: "/products" },
    robots: { index: false, follow: true },
  };
}

export default async function ProductsPage({ params, searchParams }: Props) {
  const shop = await getShop((await params).shop);
  if (!shop) notFound();

  const filters = parseListingParams(await searchParams);
  const [products, brands, all] = await Promise.all([
    listProducts(shop.id, filters),
    getBrands(shop.id),
    listProducts(shop.id),
  ]);

  const title = filters.q ? `“${filters.q}” ke results` : "Saare products";

  return (
    <>
      <ShopHeader shop={shop} search />
      <main>
        <Listing
          shop={shop}
          title={title}
          breadcrumb={filters.q ? "Search" : "Saare products"}
          products={products}
          brands={brands}
          showPta={all.some((p) => p.variants.some((v) => v.pta_status && v.pta_status !== "na"))}
          params={filters}
          unit="products"
        />
      </main>
      <ShopFooter shop={shop} />
    </>
  );
}
