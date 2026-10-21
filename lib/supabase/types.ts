// Database types matching supabase/migrations. Hand-written for Phase 0; once a Supabase
// project is linked, replace with:  npx supabase gen types typescript --linked > lib/supabase/types.ts

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Condition = "new" | "used" | "open_box";
export type PtaStatus = "pta" | "non_pta" | "na";
export type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";
export type Plan = "monthly" | "yearly" | "trial";
export type EventType = "shop_view" | "product_view" | "whatsapp_click";

export type Shop = {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  niche: string;
  tagline: string | null;
  hero_title: string | null;
  hero_description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  banner_mobile_url: string | null;
  theme_color: string | null;
  whatsapp_number: string;
  phone: string | null;
  address: string | null;
  maps_url: string | null;
  timings: string | null;
  tiktok_url: string | null;
  instagram_url: string | null;
  footer_about: string | null;
  delivery_policy: string | null;
  return_policy: string | null;
  warranty_note: string | null;
  trust_items: Json;
  seo_title: string | null;
  seo_description: string | null;
  plan: Plan | null;
  plan_expires_at: string | null;
  is_active: boolean | null;
  created_at: string | null;
};

export type Category = {
  id: string;
  shop_id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number | null;
  show_on_home: boolean | null;
  is_visible: boolean | null;
};

export type Product = {
  id: string;
  shop_id: string;
  category_id: string | null;
  brand: string | null;
  model_name: string;
  slug: string;
  condition: Condition | null;
  condition_rating: string | null;
  battery_health: number | null;
  repair_history: string | null;
  description: string | null;
  has_box: boolean | null;
  box_contents: string[] | null;
  warranty: string | null;
  colors: Json | null;
  features: Json | null;
  specs: Json | null;
  tiktok_video_url: string | null;
  is_featured: boolean | null;
  is_visible: boolean | null;
  show_reviews: boolean | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string | null;
};

export type ProductImage = {
  id: string;
  shop_id: string;
  product_id: string;
  url: string;
  label: string | null;
  sort_order: number | null;
};

export type ProductVariant = {
  id: string;
  shop_id: string;
  product_id: string;
  storage: string | null;
  ram: string | null;
  pta_status: PtaStatus | null;
  price: number;
  sale_price: number | null;
  in_stock: boolean | null;
  sort_order: number | null;
};

export type Order = {
  id: string;
  shop_id: string;
  product_id: string | null;
  variant_id: string | null;
  snapshot: Json;
  status: OrderStatus | null;
  customer_name: string | null;
  customer_phone: string | null;
  address: string | null;
  color: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type Review = {
  id: string;
  shop_id: string;
  product_id: string | null;
  type: "text" | "video";
  customer_name: string | null;
  location: string | null;
  product_label: string | null;
  text: string | null;
  rating: number | null;
  tiktok_url: string | null;
  is_visible: boolean | null;
  sort_order: number | null;
  created_at: string | null;
};

export type AppEvent = {
  id: number;
  shop_id: string;
  product_id: string | null;
  type: EventType;
  referrer: string | null;
  created_at: string | null;
};

export type Admin = { user_id: string; created_at: string };

/** Row → table definition. `Req` are the columns without a DB default. */
type Table<Row, Req extends keyof Row, Omitted extends keyof Row = never> = {
  Row: Row;
  Insert: Pick<Row, Req> & Partial<Omit<Row, Req | Omitted>>;
  Update: Partial<Omit<Row, Omitted>>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      admins: Table<Admin, "user_id">;
      shops: Table<Shop, "owner_id" | "slug" | "name" | "whatsapp_number">;
      categories: Table<Category, "shop_id" | "name" | "slug">;
      products: Table<Product, "shop_id" | "model_name" | "slug">;
      product_images: Table<ProductImage, "shop_id" | "product_id" | "url">;
      product_variants: Table<ProductVariant, "shop_id" | "product_id" | "price">;
      orders: Table<Order, "shop_id" | "snapshot">;
      reviews: Table<Review, "shop_id" | "type">;
      events: Table<AppEvent, "shop_id" | "type", "id">;
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      owns_shop: { Args: { p_shop_id: string }; Returns: boolean };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
