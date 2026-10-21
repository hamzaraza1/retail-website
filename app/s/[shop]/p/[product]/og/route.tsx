import { ImageResponse } from "next/og";
import { conditionLabel, defaultVariant, effectivePrice, PTA_LONG } from "@/lib/catalog";
import { getProduct, getShop } from "@/lib/data";
import { formatPrice } from "@/lib/format";

// Link-preview card for products without a photo yet (1200×630, used as og:image).

export async function GET(_req: Request, { params }: { params: Promise<{ shop: string; product: string }> }) {
  const { shop: shopSlug, product: slug } = await params;
  const shop = await getShop(shopSlug);
  const product = shop && (await getProduct(shop.id, slug));
  if (!shop || !product) return new Response("Not found", { status: 404 });

  const v = defaultVariant(product.variants);
  const accent = shop.theme_color ?? "#1D4ED8";
  const details = [
    conditionLabel(product),
    v?.storage,
    v?.pta_status && v.pta_status !== "na" ? PTA_LONG[v.pta_status] : null,
  ].filter(Boolean);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0F172A", color: "#FFFFFF", padding: 64 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 18,
                background: accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
                fontWeight: 800,
              }}
            >
              {shop.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ fontSize: 36, fontWeight: 700 }}>{shop.name}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>{product.model_name}</div>
            <div style={{ fontSize: 34, color: "#C7CEDA" }}>{details.join(" · ")}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {v && <div style={{ fontSize: 60, fontWeight: 800 }}>{formatPrice(effectivePrice(v))}</div>}
            <div style={{ fontSize: 28, padding: "10px 22px", borderRadius: 999, background: "#0E7A3F" }}>
              WhatsApp par order
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 300 }}>
          <div style={{ width: 190, height: 380, borderRadius: 36, border: "8px solid #475569", background: "#1E293B" }} />
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
