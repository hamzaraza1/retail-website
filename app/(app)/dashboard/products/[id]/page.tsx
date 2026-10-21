import { notFound } from "next/navigation";
import { ProductForm } from "@/components/dashboard/ProductForm";
import { toFormState } from "@/components/dashboard/productFormState";
import { requireOwner } from "@/lib/auth";
import { dashboardCategories, dashboardProduct, shopById } from "@/lib/data/mutations";
import { shopOrigin } from "@/lib/seo";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { shopId } = await requireOwner();
  const product = dashboardProduct(shopId, (await params).id);
  if (!product) notFound();
  const shop = shopById(shopId)!;
  return (
    <ProductForm
      key={product.id}
      initial={toFormState(product)}
      categories={dashboardCategories(shopId).map((c) => ({ id: c.id, name: c.name }))}
      shopName={shop.name}
      shopHost={shopOrigin(shop.slug).replace(/^https?:\/\//, "")}
      saved={(await searchParams).saved === "1"}
    />
  );
}
