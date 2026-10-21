import { ProductForm } from "@/components/dashboard/ProductForm";
import { emptyProduct } from "@/components/dashboard/productFormState";
import { requireOwner } from "@/lib/auth";
import { dashboardCategories, shopById } from "@/lib/data/mutations";
import { shopOrigin } from "@/lib/seo";

export default async function NewProductPage() {
  const { shopId } = await requireOwner();
  const shop = shopById(shopId)!;
  const categories = dashboardCategories(shopId);
  const used = categories.find((c) => c.slug === "used-phones") ?? categories[0];
  return (
    <ProductForm
      initial={emptyProduct(used?.id ?? "")}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      shopName={shop.name}
      shopHost={shopOrigin(shop.slug).replace(/^https?:\/\//, "")}
    />
  );
}
