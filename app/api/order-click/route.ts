import { NextResponse, type NextRequest } from "next/server";
import { getOrderTarget, recordOrderClick } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { PTA_SHORT } from "@/lib/catalog";

// Called (fire-and-forget) when a customer taps "WhatsApp par Order karein".
// Creates a pending order + whatsapp_click event from server-side data — the client only
// sends ids, so prices in the snapshot can't be spoofed.

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, { count: number; reset: number }>();

/** Basic per-IP limit (per server instance) against fake-order spam. */
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.reset < now) {
    if (hits.size > 10_000) hits.clear();
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

/** tiktok / instagram / google / facebook / direct, from document.referrer of the product page. */
function referrerSource(ref: string | null): string {
  if (!ref) return "direct";
  const host = (() => {
    try {
      return new URL(ref).hostname;
    } catch {
      return "";
    }
  })();
  for (const source of ["tiktok", "instagram", "google", "facebook"]) {
    if (host.includes(source)) return source;
  }
  return "other";
}

const isId = (x: unknown): x is string => typeof x === "string" && x.length > 0 && x.length <= 64;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) return new NextResponse(null, { status: 429 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const { shop, productId, variantId, ref } = (body ?? {}) as Record<string, unknown>;
  if (!isId(shop) || !isId(productId) || (variantId !== undefined && !isId(variantId))) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const target = await getOrderTarget(shop, productId, variantId);
  if (!target) return NextResponse.json({ error: "not found" }, { status: 404 });
  const { product, variant } = target;

  const price = variant ? (variant.sale_price ?? variant.price) : null;
  await recordOrderClick({
    shopId: target.shop.id,
    productId: product.id,
    variantId: variant?.id ?? null,
    snapshot: {
      name: product.model_name,
      storage: variant?.storage ?? null,
      pta: variant?.pta_status ? PTA_SHORT[variant.pta_status] || null : null,
      price,
      price_label: price !== null ? formatPrice(price) : null,
    },
    referrer: referrerSource(typeof ref === "string" ? ref : null),
  });

  return new NextResponse(null, { status: 204 });
}
