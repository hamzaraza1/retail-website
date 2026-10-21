import { SettingsForm } from "@/components/dashboard/SettingsForm";
import { requireOwner } from "@/lib/auth";
import { shopTrustItems } from "@/lib/catalog";
import { shopById } from "@/lib/data/mutations";
import { shopOrigin } from "@/lib/seo";

export default async function SettingsPage() {
  const { shopId } = await requireOwner();
  const s = shopById(shopId)!;
  const v = (x: string | null) => x ?? "";
  return (
    <SettingsForm
      shopUrl={shopOrigin(s.slug)}
      initial={{
        name: s.name,
        tagline: v(s.tagline),
        hero_title: v(s.hero_title),
        hero_description: v(s.hero_description),
        theme_color: s.theme_color ?? "#1D4ED8",
        logo_url: v(s.logo_url),
        banner_url: v(s.banner_url),
        whatsapp_number: s.whatsapp_number,
        phone: v(s.phone),
        tiktok_url: v(s.tiktok_url),
        instagram_url: v(s.instagram_url),
        address: v(s.address),
        maps_url: v(s.maps_url),
        timings: v(s.timings),
        footer_about: v(s.footer_about),
        delivery_policy: v(s.delivery_policy),
        return_policy: v(s.return_policy),
        warranty_note: v(s.warranty_note),
        trust_items: shopTrustItems(s).map((t) => ({ title: t.title, detail: t.detail ?? "" })),
        seo_title: v(s.seo_title),
        seo_description: v(s.seo_description),
      }}
    />
  );
}
