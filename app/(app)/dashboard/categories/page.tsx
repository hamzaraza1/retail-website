import { CategoryManager } from "@/components/dashboard/CategoryManager";
import { PageHead } from "@/components/dashboard/ui";
import { requireOwner } from "@/lib/auth";
import { dashboardCategories, dashboardProducts } from "@/lib/data/mutations";

export default async function CategoriesPage() {
  const { shopId } = await requireOwner();
  const products = dashboardProducts(shopId);
  const rows = dashboardCategories(shopId).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? "",
    showOnHome: c.show_on_home ?? true,
    visible: c.is_visible ?? true,
    count: products.filter((p) => p.category_id === c.id).length,
  }));
  return (
    <>
      <PageHead title="Categories" />
      <CategoryManager rows={rows} />
    </>
  );
}
