// In-memory data store for demo mode: a mutable copy of the demo shop plus user accounts.
// The storefront reads it and the dashboard writes it, so edits show up on the shop at once.
// It lives as long as the server process (and survives dev hot reloads via globalThis);
// a restart resets it to the demo data. Replaced by the database later.

import "server-only";
import { scryptSync, randomBytes } from "node:crypto";
import type {
  Category,
  Product,
  ProductImage,
  ProductVariant,
  Review,
  Shop,
} from "@/lib/supabase/types";
import * as demo from "./demo";

export type Role = "admin" | "owner";

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  /** Owners only: the one shop they manage. */
  shopId: string | null;
};

export type Store = {
  shops: Shop[];
  categories: Category[];
  products: Product[];
  images: ProductImage[];
  variants: ProductVariant[];
  reviews: Review[];
  users: User[];
};

/** scrypt hash as "salt:hash" (hex). */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 32).toString("hex")}`;
}

function seed(): Store {
  return {
    shops: structuredClone(demo.shops),
    categories: structuredClone(demo.categories),
    products: structuredClone(demo.products),
    images: structuredClone(demo.images),
    variants: structuredClone(demo.variants),
    reviews: structuredClone(demo.reviews),
    users: [
      // Demo logins (same as supabase/seed.sql for the owner).
      { id: "user-admin", email: "admin@yourbrand.pk", passwordHash: hashPassword("admin12345"), role: "admin", shopId: null },
      { id: "demo-owner", email: "demo@zaibmobiles.test", passwordHash: hashPassword("demo12345"), role: "owner", shopId: demo.shops[0].id },
    ],
  };
}

const g = globalThis as typeof globalThis & { __shopStore?: Store };
export const store: Store = (g.__shopStore ??= seed());

export const newId = (prefix: string) => `${prefix}-${randomBytes(6).toString("hex")}`;
