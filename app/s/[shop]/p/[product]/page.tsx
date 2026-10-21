import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/storefront/Badge";
import { BuyBox } from "@/components/storefront/BuyBox";
import { ProductGrid } from "@/components/storefront/ProductCard";
import { ProductGallery } from "@/components/storefront/ProductGallery";
import { StarIcon, CheckIcon } from "@/components/ui/icons";
import { TextReviewCards } from "@/components/storefront/Reviews";
import Link from "next/link";
import {
  BOX_ITEMS,
  conditionLabel,
  highlightSpecs,
  productColors,
  productFeatures,
  productSpecs,
} from "@/lib/catalog";
import { getProduct, getRelated, getReviews, getShop } from "@/lib/data";
import { productDescription, productJsonLd, productTitle, productUrl } from "@/lib/seo";

type Props = { params: Promise<{ shop: string; product: string }> };

async function load(params: Props["params"]) {
  const { shop: shopSlug, product: slug } = await params;
  const shop = await getShop(shopSlug);
  const product = shop && (await getProduct(shop.id, slug));
  return shop && product ? { shop, product } : null;
}

/** First product photo, else a generated card — WhatsApp link previews depend on this. */
function ogImage(shopSlug: string, product: { slug: string; images: { url: string }[] }) {
  return product.images[0]?.url ?? `${productUrl(shopSlug, product.slug)}/og`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await load(params);
  if (!data) return {};
  const { shop, product } = data;
  const title = productTitle(product, shop);
  const description = productDescription(product, shop);
  const image = ogImage(shop.slug, product);
  return {
    title,
    description,
    alternates: { canonical: `/p/${product.slug}` },
    openGraph: {
      title,
      description,
      url: `/p/${product.slug}`,
      type: "website",
      images: [
        product.images.length
          ? { url: image, alt: product.model_name }
          : { url: image, width: 1200, height: 630, alt: product.model_name },
      ],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

function Section({ title, children, aside }: { title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <h2 className="m-0 font-display text-[26px] font-extrabold sm:text-[30px]">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export default async function ProductPage({ params }: Props) {
  const data = await load(params);
  if (!data) notFound();
  const { shop, product } = data;

  const [related, reviews] = await Promise.all([
    getRelated(product),
    product.show_reviews ? getReviews(shop.id, { type: "text", productId: product.id }) : [],
  ]);

  const url = productUrl(shop.slug, product.slug);
  const features = productFeatures(product);
  const specs = productSpecs(product);
  const isPhone = product.variants.some((v) => v.storage);
  const isUsed = product.condition === "used";
  const avg = reviews.length ? reviews.reduce((s, r) => s + (r.rating ?? 5), 0) / reviews.length : 0;

  const conditionCards = [
    product.battery_health != null && { label: "Battery health", value: `${product.battery_health}%` },
    product.condition_rating && { label: "Condition", value: product.condition_rating },
    product.repair_history && { label: "Repair history", value: product.repair_history },
    { label: "Box", value: product.has_box ? "With box" : "Without box" },
  ].filter((x): x is { label: string; value: string } => !!x);

  const included = new Set(product.box_contents ?? []);
  const jsonLd = productJsonLd(product, shop, url, ogImage(shop.slug, product));

  return (
    <>
      <script
        type="application/ld+json"
        // JSON.stringify output with "<" escaped so a product name can't close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <nav aria-label="Breadcrumb" className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-2 px-4 pt-4 text-sm text-muted">
        <Link href="/" className="flex min-h-11 items-center text-ink underline-offset-2 hover:underline">
          Home
        </Link>
        {product.category && (
          <>
            <span aria-hidden="true">/</span>
            <Link
              href={`/c/${product.category.slug}`}
              className="flex min-h-11 items-center text-ink underline-offset-2 hover:underline"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="min-w-0 truncate">{product.model_name}</span>
      </nav>

      <main className="mx-auto grid max-w-[1200px] gap-10 px-4 pt-2 pb-8 md:grid-cols-2">
        <ProductGallery
          name={product.model_name}
          images={product.images}
          videoUrl={product.tiktok_video_url}
          badges={
            <>
              <Badge tone="white">{conditionLabel(product)}</Badge>
              {isPhone && <Badge tone="white">{product.has_box ? "With box" : "Without box"}</Badge>}
            </>
          }
        />
        <BuyBox
          shopSlug={shop.slug}
          whatsappNumber={shop.whatsapp_number}
          phone={shop.phone}
          productId={product.id}
          name={product.model_name}
          eyebrow={[product.brand, isPhone ? conditionLabel(product).split(" ")[0] : product.category?.name]
            .filter(Boolean)
            .join(" · ")}
          hasBox={!!product.has_box}
          url={url}
          variants={product.variants}
          colors={productColors(product)}
          highlights={highlightSpecs(product)}
          batteryHealth={isUsed ? product.battery_health : null}
        />
      </main>

      <div className="mx-auto flex max-w-[1200px] flex-col gap-12 px-4 pt-4 pb-12">
        {product.description && <p className="m-0 max-w-[70ch] text-base leading-relaxed text-slate-700">{product.description}</p>}

        {isUsed && (
          <Section title="Phone ki condition">
            <dl className="m-0 grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
              {conditionCards.map((c) => (
                <div key={c.label} className="flex flex-col gap-1.5 rounded-card bg-soft p-4.5">
                  <dt className="text-[13px] text-muted">{c.label}</dt>
                  <dd className="m-0 font-display text-[22px] leading-tight font-extrabold sm:text-[26px]">{c.value}</dd>
                </div>
              ))}
            </dl>
          </Section>
        )}

        {(features.length > 0 || specs.length > 0 || isPhone) && (
          <div className="grid gap-10 md:grid-cols-2">
            {(features.length > 0 || isPhone) && (
              <Section title={features.length ? "Key features" : "Box aur warranty"}>
                {features.length > 0 && (
                  <ul className="m-0 flex list-none flex-col gap-3 p-0">
                    {features.map((f) => (
                      <li key={f.title} className="flex items-start gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                          <CheckIcon size={16} />
                        </span>
                        <span className="flex flex-col gap-0.5">
                          <span className="font-bold">{f.title}</span>
                          {f.detail && <span className="text-sm leading-normal text-muted">{f.detail}</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {isPhone && (
                  <div className="flex flex-col gap-2.5 rounded-card border border-line p-4.5">
                    <p className="m-0 font-bold">Box mein kya milega</p>
                    <ul className="m-0 flex list-none flex-wrap gap-2 p-0 text-sm font-bold">
                      <li className="rounded-full bg-pta-bg px-3 py-1.5 text-pta-fg">Phone</li>
                      {product.has_box && <li className="rounded-full bg-pta-bg px-3 py-1.5 text-pta-fg">Original box</li>}
                      {BOX_ITEMS.map((item) =>
                        included.has(item.id) ? (
                          <li key={item.id} className="rounded-full bg-pta-bg px-3 py-1.5 text-pta-fg">
                            {item.label}
                          </li>
                        ) : (
                          <li key={item.id} className="rounded-full bg-soft px-3 py-1.5 text-muted line-through">
                            <span className="sr-only">Nahi: </span>
                            {item.label}
                          </li>
                        ),
                      )}
                    </ul>
                    {product.warranty && <p className="m-0 text-sm text-muted">Warranty: {product.warranty}</p>}
                  </div>
                )}
              </Section>
            )}

            {specs.length > 0 && (
              <Section title="Specifications">
                <table className="w-full border-collapse text-[15px]">
                  <tbody>
                    {specs.map((s) => (
                      <tr key={s.key} className="border-b border-line">
                        <th scope="row" className="w-[38%] py-3 pr-3 text-left align-top font-medium text-muted">
                          {s.key}
                        </th>
                        <td className="py-3 font-medium">{s.value}</td>
                      </tr>
                    ))}
                    {product.warranty && (
                      <tr className="border-b border-line">
                        <th scope="row" className="w-[38%] py-3 pr-3 text-left align-top font-medium text-muted">
                          Warranty
                        </th>
                        <td className="py-3 font-medium">{product.warranty}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Section>
            )}
          </div>
        )}

        {reviews.length > 0 && (
          <Section
            title="Customer reviews"
            aside={
              <span className="flex items-center gap-1.5 font-bold">
                <StarIcon className="text-star" />
                {avg.toFixed(1)} · {reviews.length} reviews
              </span>
            }
          >
            <TextReviewCards reviews={reviews.slice(0, 3)} avatars={false} />
          </Section>
        )}

        {related.length > 0 && (
          <Section title="Yeh bhi dekhein">
            <ProductGrid products={related} />
          </Section>
        )}
      </div>

    </>
  );
}
