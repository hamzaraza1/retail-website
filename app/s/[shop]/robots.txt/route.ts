import { getShop } from "@/lib/data";
import { shopOrigin } from "@/lib/seo";

export async function GET(_req: Request, { params }: { params: Promise<{ shop: string }> }) {
  const shop = await getShop((await params).shop);
  if (!shop) return new Response("Not found", { status: 404 });

  const body = `User-agent: *\nAllow: /\nDisallow: /products?\n\nSitemap: ${shopOrigin(shop.slug)}/sitemap.xml\n`;
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
