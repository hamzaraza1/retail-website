import Link from "next/link";
import { btnPrimary, btnSecondary, Card, PageHead } from "@/components/dashboard/ui";
import { requireOwner } from "@/lib/auth";
import { dashboardCategories, dashboardProducts, shopById } from "@/lib/data/mutations";
import { shopOrigin } from "@/lib/seo";

export default async function OverviewPage() {
  const { shopId } = await requireOwner();
  const shop = shopById(shopId)!;
  const products = dashboardProducts(shopId);
  const live = products.filter((p) => p.is_visible);
  const outOfStock = live.filter((p) => !p.variants.some((v) => v.in_stock));
  const noPhoto = live.filter((p) => !p.images.length);

  const stats = [
    { label: "Shop par live products", value: live.length },
    { label: "Draft / chhupe hue", value: products.length - live.length },
    { label: "Stock khatam", value: outOfStock.length },
    { label: "Categories", value: dashboardCategories(shopId).length },
  ];

  return (
    <>
      <PageHead
        title={`Assalam o Alaikum, ${shop.name}`}
        actions={
          <>
            <a href={shopOrigin(shop.slug)} target="_blank" rel="noopener noreferrer" className={btnSecondary}>
              Shop dekhein ↗
            </a>
            <Link href="/dashboard/products/new" className={btnPrimary}>
              + Naya product
            </Link>
          </>
        }
      />
      <dl className="m-0 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-1 rounded-card bg-white p-4">
            <dt className="text-[13px] text-muted">{s.label}</dt>
            <dd className="m-0 font-display text-[28px] leading-none font-extrabold tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>
      {noPhoto.length > 0 && (
        <Card title="Photos lagayein" hint="Photo wale products par zyada log click karte hain, aur WhatsApp par link ka preview bhi photo se banta hai.">
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {noPhoto.slice(0, 8).map((p) => (
              <li key={p.id}>
                <Link href={`/dashboard/products/${p.id}`} className="flex h-11 items-center rounded-full bg-soft px-4 text-sm font-bold text-ink hover:bg-line">
                  {p.model_name}
                </Link>
              </li>
            ))}
            {noPhoto.length > 8 && <li className="flex h-11 items-center px-2 text-sm text-muted">+{noPhoto.length - 8} aur</li>}
          </ul>
        </Card>
      )}
      <Card title="Views aur WhatsApp clicks">
        <p className="m-0 text-[15px] text-muted">
          Shop views, product views aur kis phone par kitne WhatsApp clicks aaye, yeh stats Phase 3 mein yahan dikhenge.
        </p>
      </Card>
    </>
  );
}
