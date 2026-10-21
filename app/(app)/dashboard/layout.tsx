import type { Metadata } from "next";
import { DashNav } from "@/components/dashboard/DashNav";
import { ShopLogo } from "@/components/storefront/ShopHeader";
import { requireOwner } from "@/lib/auth";
import { PLATFORM_NAME } from "@/lib/brand";
import { shopById } from "@/lib/data/mutations";
import { shopOrigin } from "@/lib/seo";
import { logout } from "../login/actions";

export const metadata: Metadata = { title: `Dashboard | ${PLATFORM_NAME}`, robots: { index: false } };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireOwner();
  const shop = shopById(user.shopId)!;

  return (
    <div
      style={{ "--accent": shop.theme_color ?? "#1D4ED8" } as React.CSSProperties}
      className="flex min-h-dvh flex-col bg-soft lg:flex-row"
    >
      <aside className="flex flex-col gap-4 bg-ink px-4 py-4 text-white lg:sticky lg:top-0 lg:h-dvh lg:w-[240px] lg:shrink-0 lg:gap-6 lg:px-3.5 lg:py-5">
        <div className="flex items-center justify-between gap-3 lg:px-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <ShopLogo shop={shop} size={36} />
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-bold">{shop.name}</span>
              <span className="text-xs text-slate-400">Shop dashboard</span>
            </span>
          </div>
          <a
            href={shopOrigin(shop.slug)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 shrink-0 items-center rounded-[10px] border border-slate-700 px-3 text-sm font-bold lg:hidden"
          >
            Shop ↗
          </a>
        </div>
        <DashNav />
        <div className="mt-auto hidden flex-col gap-2 lg:flex">
          <a
            href={shopOrigin(shop.slug)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 items-center rounded-[10px] border border-slate-700 px-3 text-sm font-bold"
          >
            Apni shop dekhein ↗
          </a>
          <form action={logout}>
            <button type="submit" className="flex h-11 w-full items-center rounded-[10px] px-3 text-sm text-slate-300 hover:text-white">
              Logout
            </button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 pt-6 pb-12">
        <div className="mx-auto flex max-w-[920px] flex-col gap-4.5">{children}</div>
        <form action={logout} className="mx-auto mt-8 flex max-w-[920px] justify-center lg:hidden">
          <button type="submit" className="flex h-11 items-center px-4 text-sm font-bold text-muted underline">
            Logout ({user.email})
          </button>
        </form>
      </main>
    </div>
  );
}
