import type { Metadata } from "next";
import { AdminPanel } from "@/components/dashboard/AdminPanel";
import { requireAdmin } from "@/lib/auth";
import { PLATFORM_NAME } from "@/lib/brand";
import { adminShops } from "@/lib/data/mutations";
import { ROOT_DOMAIN, shopOrigin } from "@/lib/seo";
import { logout } from "../login/actions";

export const metadata: Metadata = { title: `Admin | ${PLATFORM_NAME}`, robots: { index: false } };

export default async function AdminPage() {
  const admin = await requireAdmin();
  const rows = adminShops().map(({ shop, owner, products }) => ({
    id: shop.id,
    name: shop.name,
    slug: shop.slug,
    url: shopOrigin(shop.slug),
    ownerEmail: owner?.email ?? "—",
    plan: shop.plan ?? "trial",
    expires: shop.plan_expires_at,
    active: !!shop.is_active,
    products,
  }));

  return (
    <div className="min-h-dvh bg-soft">
      <header className="bg-ink text-white">
        <div className="mx-auto flex max-w-[1000px] items-center justify-between gap-3 px-4 py-4">
          <span className="flex flex-col">
            <span className="font-display text-xl font-extrabold">{PLATFORM_NAME} Admin</span>
            <span className="text-xs text-slate-400">{admin.email}</span>
          </span>
          <form action={logout}>
            <button type="submit" className="flex h-11 items-center rounded-[10px] border border-slate-700 px-3 text-sm font-bold">
              Logout
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto flex max-w-[1000px] flex-col gap-4.5 px-4 pt-6 pb-12">
        <AdminPanel rows={rows} rootDomain={ROOT_DOMAIN} />
      </main>
    </div>
  );
}
