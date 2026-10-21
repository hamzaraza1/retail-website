import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon } from "@/components/ui/icons";
import { BudgetFinder } from "@/components/storefront/BudgetFinder";
import { BrandPills, Hero, TrustStrip, VisitShop } from "@/components/storefront/HomeSections";
import { ProductGrid } from "@/components/storefront/ProductCard";
import { TextReviewCards, VideoReviewGrid } from "@/components/storefront/Reviews";
import { Tabs } from "@/components/storefront/Tabs";
import { getBrands, getFinderPhones, getHomeTabs, getReviews, getShop } from "@/lib/data";

export default async function ShopHome({ params }: { params: Promise<{ shop: string }> }) {
  const shop = await getShop((await params).shop);
  if (!shop) notFound();

  const [tabs, brands, textReviews, videoReviews, finderPhones] = await Promise.all([
    getHomeTabs(shop.id),
    getBrands(shop.id),
    getReviews(shop.id, { type: "text" }),
    getReviews(shop.id, { type: "video" }),
    getFinderPhones(shop.id),
  ]);

  return (
    <>
      <main>
        <Hero shop={shop} />
        <BrandPills brands={brands} />

        {tabs.length > 0 && (
          <section id="products" className="mx-auto flex max-w-[1200px] scroll-mt-4 flex-col gap-5 px-4 pt-8 pb-4">
            <h2 className="m-0 font-display text-[28px] font-extrabold tracking-tight sm:text-[34px]">
              Hamare Products
            </h2>
            <Tabs
              labels={tabs.map((t) => t.category.name)}
              panels={tabs.map(({ category, products }) => (
                <div key={category.id} className="flex flex-col gap-6">
                  <ProductGrid products={products} />
                  <Link
                    href={`/c/${category.slug}`}
                    className="flex h-[50px] items-center gap-2 self-center rounded-full border-[1.5px] border-ink px-6.5 font-bold text-ink hover:bg-ink hover:text-white"
                  >
                    Saare {category.name} dekhein
                    <ArrowRightIcon />
                  </Link>
                </div>
              ))}
            />
          </section>
        )}

        {finderPhones.length > 1 && <BudgetFinder phones={finderPhones} whatsappNumber={shop.whatsapp_number} />}

        <TrustStrip shop={shop} />

        {textReviews.length > 0 && (
          <section className="mx-auto flex max-w-[1200px] flex-col gap-5 px-4 py-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="m-0 font-display text-[28px] font-extrabold sm:text-[34px]">Customers kya kehte hain</h2>
              {shop.tiktok_url && (
                <a href={shop.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-[15px] font-bold text-ink underline">
                  TikTok par video reviews
                </a>
              )}
            </div>
            <TextReviewCards reviews={textReviews.slice(0, 3)} />
          </section>
        )}

        {videoReviews.length > 0 && (
          <section className="mx-auto flex max-w-[1200px] flex-col gap-5 px-4 py-6">
            <div className="flex flex-col gap-1.5">
              <h2 className="m-0 font-display text-[28px] font-extrabold sm:text-[34px]">Video reviews</h2>
              <p className="m-0 text-base text-muted">Asli customers, apne phones ke saath</p>
            </div>
            <VideoReviewGrid reviews={videoReviews} />
          </section>
        )}

        <VisitShop shop={shop} />
      </main>
    </>
  );
}
