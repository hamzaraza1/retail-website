import Link from "next/link";
import { btnPrimary, PageHead } from "@/components/dashboard/ui";
import { ProductList, type ProductRow } from "@/components/dashboard/ProductList";
import { requireOwner } from "@/lib/auth";
import { effectivePrice } from "@/lib/catalog";
import { dashboardCategories, dashboardProducts, shopById } from "@/lib/data/mutations";
import { productUrl } from "@/lib/seo";

export default async function ProductsPage() {
  const { shopId } = await requireOwner();
  const shop = shopById(shopId)!;
  const rows: ProductRow[] = dashboardProducts(shopId).map((p) => {
    const prices = p.variants.map(effectivePrice);
    return {
      id: p.id,
      name: p.model_name,
      categoryId: p.category_id,
      categoryName: p.category?.name ?? null,
      cover: p.images[0]?.url ?? null,
      minPrice: prices.length ? Math.min(...prices) : null,
      maxPrice: prices.length ? Math.max(...prices) : null,
      variants: p.variants.length,
      inStock: p.variants.some((v) => v.in_stock),
      visible: !!p.is_visible,
      featured: !!p.is_featured,
      url: productUrl(shop.slug, p.slug),
    };
  });

  return (
    <>
      <PageHead
        title="Products"
        actions={
          <Link href="/dashboard/products/new" className={btnPrimary}>
            + Naya product
          </Link>
        }
      />
      <ProductList rows={rows} categories={dashboardCategories(shopId).map((c) => ({ id: c.id, name: c.name }))} />
    </>
  );
}
