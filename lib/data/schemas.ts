// Input validation for dashboard and admin writes. Shared by server actions; never trust
// the client's shape.

import { z } from "zod";
import { BOX_ITEMS } from "@/lib/catalog";

const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((s) => (s === "" ? null : s))
    .nullable();

const httpsUrl = z
  .string()
  .trim()
  .max(500)
  .refine((s) => s === "" || /^https:\/\/\S+$/.test(s), "Link https:// se shuru hona chahiye")
  .transform((s) => (s === "" ? null : s))
  .nullable();

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(80)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Sirf chhote English huroof, numbers aur - (jaise iphone-13-used)");

// Photos: data:image/* URLs in demo mode (resized to WebP in the browser), https URLs with storage.
const imageUrl = z
  .string()
  .max(1_500_000, "Photo bohat bari hai")
  .refine((s) => /^data:image\/(webp|jpeg|png);base64,/.test(s) || /^https:\/\//.test(s), "Photo ka link sahi nahi");

export const productSchema = z.object({
  id: z.string().max(64).optional(),
  category_id: z.string().max(64).nullable(),
  brand: text(40),
  model_name: z.string().trim().min(1, "Model ka naam likhein").max(80),
  slug: z.union([slugSchema, z.literal("")]),
  condition: z.enum(["new", "used", "open_box"]),
  condition_rating: text(10),
  battery_health: z.number().int().min(0).max(100).nullable(),
  repair_history: text(120),
  description: text(2000),
  has_box: z.boolean(),
  box_contents: z.array(z.enum(BOX_ITEMS.map((b) => b.id) as [string, ...string[]])).max(BOX_ITEMS.length),
  warranty: text(80),
  colors: z
    .array(z.object({ name: z.string().trim().min(1).max(30), hex: z.string().regex(/^#[0-9a-fA-F]{6}$/) }))
    .max(12),
  features: z
    .array(z.object({ title: z.string().trim().min(1).max(80), detail: z.string().trim().max(160) }))
    .max(12),
  specs: z.array(z.object({ key: z.string().trim().min(1).max(40), value: z.string().trim().min(1).max(120) })).max(30),
  tiktok_video_url: httpsUrl,
  is_featured: z.boolean(),
  is_visible: z.boolean(),
  show_reviews: z.boolean(),
  seo_title: text(70),
  seo_description: text(200),
  images: z.array(z.object({ id: z.string().max(64).optional(), url: imageUrl, label: text(40) })).max(8),
  variants: z
    .array(
      z.object({
        id: z.string().max(64).optional(),
        storage: text(20),
        ram: text(20),
        pta_status: z.enum(["pta", "non_pta", "na"]),
        price: z.number().int().min(1, "Price likhein").max(10_000_000),
        sale_price: z.number().int().min(1).max(10_000_000).nullable(),
        in_stock: z.boolean(),
      }),
    )
    .min(1, "Kam az kam ek price (variant) zaroori hai")
    .max(24),
});
export type ProductInput = z.input<typeof productSchema>;

const whatsapp = z
  .string()
  .trim()
  .transform((s) => s.replace(/\D/g, ""))
  .transform((d) => (d.startsWith("03") ? `92${d.slice(1)}` : d.startsWith("0092") ? d.slice(2) : d))
  .refine((d) => /^923\d{9}$/.test(d), "WhatsApp number 03XX XXXXXXX ya 923XXXXXXXXX format mein likhein");

export const shopSettingsSchema = z.object({
  name: z.string().trim().min(2).max(60),
  tagline: text(80),
  hero_title: text(120),
  hero_description: text(400),
  theme_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  logo_url: z.union([imageUrl, z.literal("")]).transform((s) => (s === "" ? null : s)),
  banner_url: z.union([imageUrl, z.literal("")]).transform((s) => (s === "" ? null : s)),
  whatsapp_number: whatsapp,
  phone: text(20),
  tiktok_url: httpsUrl,
  instagram_url: httpsUrl,
  address: text(200),
  maps_url: httpsUrl,
  timings: text(120),
  footer_about: text(300),
  delivery_policy: text(300),
  return_policy: text(300),
  warranty_note: text(120),
  trust_items: z
    .array(z.object({ title: z.string().trim().min(1).max(40), detail: z.string().trim().max(120) }))
    .max(4),
  seo_title: text(70),
  seo_description: text(200),
});
export type ShopSettingsInput = z.input<typeof shopSettingsSchema>;

export const RESERVED_SLUGS = ["app", "www", "admin", "api", "mail", "dashboard", "login"];

export const newShopSchema = z.object({
  name: z.string().trim().min(2, "Shop ka naam likhein").max(60),
  slug: slugSchema.refine((s) => !RESERVED_SLUGS.includes(s), "Yeh naam reserved hai"),
  whatsapp_number: whatsapp,
  owner_email: z.string().trim().toLowerCase().email("Email sahi nahi"),
  owner_password: z.string().min(8, "Password kam az kam 8 characters"),
  plan: z.enum(["trial", "monthly", "yearly"]),
  plan_expires_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expiry date chunein"),
});
