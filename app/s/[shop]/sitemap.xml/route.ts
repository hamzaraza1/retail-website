import { getCategories, getShop, listAllProductSlugs } from "@/lib/data";
import { shopOrigin } from "@/lib/seo";

// Per-shop sitemap, served at <shop>.<domain>/sitemap.xml via the subdomain rewrite.

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

export async function GET(_req: Request, { params }: { params: Promise<{ shop: string }> }) {
  const shop = await getShop((await params).shop);
  if (!shop) return new Response("Not found", { status: 404 });

  const origin = shopOrigin(shop.slug);
  const [categories, products] = await Promise.all([getCategories(shop.id), listAllProductSlugs(shop.id)]);
  const urls: { loc: string; lastmod?: string }[] = [
    { loc: `${origin}/` },
    ...categories.map((c) => ({ loc: `${origin}/c/${c.slug}` })),
    ...products.map((p) => ({ loc: `${origin}/p/${p.slug}`, lastmod: p.created_at ?? undefined })),
  ];

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map((u) => `  <url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`)
      .join("\n") +
    `\n</urlset>\n`;

  return new Response(body, { headers: { "content-type": "application/xml; charset=utf-8" } });
}
