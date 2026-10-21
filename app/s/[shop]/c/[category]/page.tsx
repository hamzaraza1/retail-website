import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Listing, parseListingParams } from "@/components/storefront/Listing";
import { ShopFooter } from "@/components/storefront/ShopFooter";
import { ShopHeader } from "@/components/storefront/ShopHeader";
import { getBrands, getCategory, getShop, listProducts } from "@/lib/data";

type Props = {
  params: Promise<{ shop: string; category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shop: shopSlug, category: slug } = await params;
  const shop = await getShop(shopSlug);
  const category = shop && (await getCategory(shop.id, slug));
  if (!shop || !category) return {};
  return {
    title: `${category.name} Price in Karachi | ${shop.name}`,
    description: category.description ?? undefined,
    // Filtered/sorted variants of this page all point at the clean URL.
    alternates: { canonical: `/c/${category.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { shop: shopSlug, category: slug } = await params;
  const shop = await getShop(shopSlug);
  const category = shop && (await getCategory(shop.id, slug));
  if (!shop || !category) notFound();

  const filters = parseListingParams(await searchParams);
  const [products, brands, all] = await Promise.all([
    listProducts(shop.id, { ...filters, categoryId: category.id }),
    getBrands(shop.id, category.id),
    listProducts(shop.id, { categoryId: category.id }),
  ]);
  const isPhones = all.some((p) => p.variants.some((v) => v.storage));

  return (
    <>
      <ShopHeader shop={shop} />
      <main>
        <Listing
          shop={shop}
          title={category.name}
          description={category.description}
          breadcrumb={category.name}
          products={products}
          brands={brands}
          showPta={all.some((p) => p.variants.some((v) => v.pta_status && v.pta_status !== "na"))}
          params={filters}
          unit={isPhones ? "phones" : "items"}
        />
      </main>
      <ShopFooter shop={shop} />
    </>
  );
}
