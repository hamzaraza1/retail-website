"use server";

// Shopkeeper actions. The shop is always taken from the session, never from the request.

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth";
import * as m from "@/lib/data/mutations";
import type { ProductInput, ShopSettingsInput } from "@/lib/data/schemas";

async function owner() {
  const user = await requireOwner();
  return { user, shopId: user.shopId };
}

/** Refresh the storefront (all pages of this shop) and the dashboard after a write. */
function refresh(shopId: string) {
  const slug = m.shopSlugOf(shopId);
  if (slug) revalidatePath(`/s/${slug}`, "layout");
  revalidatePath("/dashboard", "layout");
}

async function run<T>(fn: (shopId: string) => m.Result<T>): Promise<m.Result<T>> {
  const { shopId } = await owner();
  const res = fn(shopId);
  if (res.ok) refresh(shopId);
  return res;
}

export async function saveProductAction(input: ProductInput) {
  return run((shopId) => m.saveProduct(shopId, input));
}
export async function setProductVisibleAction(id: string, visible: boolean) {
  return run((shopId) => m.setProductVisible(shopId, id, visible));
}
export async function setProductStockAction(id: string, inStock: boolean) {
  return run((shopId) => m.setProductStock(shopId, id, inStock));
}
export async function duplicateProductAction(id: string) {
  return run((shopId) => m.duplicateProduct(shopId, id));
}
export async function deleteProductAction(id: string) {
  return run((shopId) => m.deleteProduct(shopId, id));
}

export async function createCategoryAction(name: string) {
  return run((shopId) => m.createCategory(shopId, name));
}
export async function updateCategoryAction(
  id: string,
  patch: { name?: string; description?: string | null; show_on_home?: boolean; is_visible?: boolean },
) {
  return run((shopId) => m.updateCategory(shopId, id, patch));
}
export async function moveCategoryAction(id: string, dir: -1 | 1) {
  return run((shopId) => m.moveCategory(shopId, id, dir));
}
export async function deleteCategoryAction(id: string) {
  return run((shopId) => m.deleteCategory(shopId, id));
}

export async function saveShopSettingsAction(input: ShopSettingsInput) {
  return run((shopId) => m.updateShopSettings(shopId, input));
}

export async function changePasswordAction(password: string) {
  const { user } = await owner();
  return m.changePassword(user.id, password);
}
