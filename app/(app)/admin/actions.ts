"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import * as m from "@/lib/data/mutations";

export async function createShopAction(input: Parameters<typeof m.createShop>[0]) {
  await requireAdmin();
  const res = m.createShop(input);
  if (res.ok) revalidatePath("/admin");
  return res;
}

export async function setShopActiveAction(shopId: string, active: boolean) {
  await requireAdmin();
  const res = m.setShopActive(shopId, active);
  const slug = m.shopSlugOf(shopId);
  if (res.ok && slug) revalidatePath(`/s/${slug}`, "layout");
  revalidatePath("/admin");
  return res;
}

export async function resetOwnerPasswordAction(shopId: string, password: string) {
  await requireAdmin();
  return m.resetOwnerPassword(shopId, password);
}
