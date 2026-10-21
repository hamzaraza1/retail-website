import { NextResponse, type NextRequest } from "next/server";

const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000").split(":")[0];
const RESERVED = new Set(["www"]);
const APP_PATHS = ["/login", "/forgot-password", "/dashboard", "/admin"];

function notFound(url: URL) {
  url.pathname = "/404";
  return NextResponse.rewrite(url, { status: 404 });
}

/** "zaibmobiles.yourbrand.pk" → "zaibmobiles"; "zaibmobiles.localhost:3000" → "zaibmobiles". */
function subdomainOf(host: string): string | null {
  const hostname = host.split(":")[0].toLowerCase();
  for (const root of [ROOT_DOMAIN, "localhost"]) {
    if (hostname.endsWith(`.${root}`)) {
      const sub = hostname.slice(0, -(root.length + 1));
      return sub.includes(".") ? null : sub;
    }
  }
  return null;
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const sub = subdomainOf(request.headers.get("host") ?? "");

  // app.<domain>: shopkeeper dashboard, super-admin and login.
  if (sub === "app") {
    if (url.pathname === "/") {
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    if (APP_PATHS.some((p) => url.pathname === p || url.pathname.startsWith(`${p}/`))) {
      return NextResponse.next();
    }
    return notFound(url);
  }

  // Root domain (marketing). Storefront and app routes each live on their own host,
  // so every page has exactly one URL.
  if (!sub || RESERVED.has(sub)) {
    if (["/s", ...APP_PATHS].some((p) => url.pathname === p || url.pathname.startsWith(`${p}/`))) {
      return notFound(url);
    }
    return NextResponse.next();
  }

  url.pathname = `/s/${sub}${url.pathname === "/" ? "" : url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Everything except Next internals, API routes and static files (sitemap.xml/robots.txt pass through).
  matcher: ["/((?!_next/|api/|favicon\\.ico|.*\\.(?:png|jpg|jpeg|webp|svg|ico|css|js)$).*)"],
};
