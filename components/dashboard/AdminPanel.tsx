"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createShopAction, resetOwnerPasswordAction, setShopActiveAction } from "@/app/(app)/admin/actions";
import { slugify } from "@/lib/format";
import { btnPrimary, btnSmall, Card, inputCls, labelCls, PageHead } from "./ui";

type Row = {
  id: string;
  name: string;
  slug: string;
  url: string;
  ownerEmail: string;
  plan: string;
  expires: string | null;
  active: boolean;
  products: number;
};

const PLAN_LABEL: Record<string, string> = { trial: "Trial", monthly: "Monthly · Rs. 2,000", yearly: "Yearly" };

const inDays = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

/** Readable random password the admin can send on WhatsApp. */
function makePassword() {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }) : "—";

/** Super-admin: create shop + owner, suspend/activate, reset owner password (PLAN.md §5.7). */
export function AdminPanel({ rows, rootDomain }: { rows: Row[]; rootDomain: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    whatsapp_number: "",
    owner_email: "",
    owner_password: makePassword(),
    plan: "trial" as "trial" | "monthly" | "yearly",
    plan_expires_at: inDays(14),
  });
  const [reset, setReset] = useState<{ id: string; password: string; done?: boolean } | null>(null);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreated(null);
    start(async () => {
      const res = await createShopAction(form);
      if (!res.ok) return setError(res.error);
      setCreated(
        `Shop ban gayi. Owner ko WhatsApp par bhejein:\n\nDashboard: app.${rootDomain}/login\nEmail: ${form.owner_email}\nPassword: ${form.owner_password}\nShop link: ${res.data.slug}.${rootDomain}`,
      );
      setForm((f) => ({ ...f, name: "", slug: "", whatsapp_number: "", owner_email: "", owner_password: makePassword() }));
      setSlugTouched(false);
      router.refresh();
    });
  }

  return (
    <>
      <PageHead title="Shops" />

      <Card title="Nayi shop banayein" hint="Payment ke baad. Owner ko login details aap khud bhejenge.">
        <form onSubmit={submit} className="flex flex-col gap-3.5">
          {error && (
            <p role="alert" className="m-0 rounded-input bg-nonpta-bg px-3.5 py-3 text-sm font-bold text-nonpta-fg">
              {error}
            </p>
          )}
          <div className="grid gap-3.5 sm:grid-cols-2">
            <label className={labelCls}>
              Shop ka naam
              <input
                id="shop-name"
                required
                value={form.name}
                onChange={(e) => {
                  set("name", e.target.value);
                  if (!slugTouched) set("slug", slugify(e.target.value).replace(/-/g, ""));
                }}
                placeholder="Jaise: Zaib Mobiles"
                className={inputCls}
              />
            </label>
            <label className={labelCls}>
              Shop link
              <span className="flex min-w-0 items-center overflow-hidden rounded-input border border-line-strong">
                <input
                  id="shop-slug"
                  required
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                  }}
                  className="h-[46px] min-w-0 flex-1 px-3 text-[15px] font-normal outline-none"
                />
                <span className="shrink-0 bg-soft px-3 py-3 text-sm font-normal text-muted">.{rootDomain}</span>
              </span>
            </label>
            <label className={labelCls}>
              WhatsApp number
              <input id="shop-wa" required type="tel" value={form.whatsapp_number} onChange={(e) => set("whatsapp_number", e.target.value)} placeholder="0300 1234567" className={inputCls} />
            </label>
            <label className={labelCls}>
              Owner ka email
              <input id="owner-email" required type="email" value={form.owner_email} onChange={(e) => set("owner_email", e.target.value)} className={inputCls} />
            </label>
            <label className={labelCls}>
              Password
              <span className="flex gap-2">
                <input id="owner-password" required value={form.owner_password} onChange={(e) => set("owner_password", e.target.value)} className={`${inputCls} flex-1 font-mono`} />
                <button type="button" className={btnSmall} onClick={() => set("owner_password", makePassword())}>
                  Naya
                </button>
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className={labelCls}>
                Plan
                <select
                  id="plan"
                  value={form.plan}
                  onChange={(e) => {
                    const plan = e.target.value as typeof form.plan;
                    setForm((f) => ({ ...f, plan, plan_expires_at: inDays(plan === "trial" ? 14 : plan === "monthly" ? 30 : 365) }));
                  }}
                  className={inputCls}
                >
                  <option value="trial">Trial</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </label>
              <label className={labelCls}>
                Expiry
                <input id="expires" type="date" required value={form.plan_expires_at} onChange={(e) => set("plan_expires_at", e.target.value)} className={inputCls} />
              </label>
            </div>
          </div>
          <button type="submit" className={`${btnPrimary} self-start`} disabled={pending}>
            {pending ? "Ban rahi hai…" : "Shop banayein"}
          </button>
          {created && (
            <div role="status" className="flex flex-col gap-2 rounded-input bg-pta-bg p-3.5 text-pta-fg">
              <pre className="m-0 text-sm font-bold whitespace-pre-wrap select-all">{created}</pre>
              <button
                type="button"
                className={`${btnSmall} self-start`}
                onClick={() => navigator.clipboard?.writeText(created.split("\n\n")[1] ?? created).catch(() => {})}
              >
                Details copy karein
              </button>
            </div>
          )}
        </form>
      </Card>

      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
        {rows.map((r) => {
          const expired = r.expires ? new Date(r.expires).getTime() < Date.now() : false;
          return (
            <li key={r.id} className="flex flex-col gap-3 rounded-card bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-bold">{r.name}</span>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-[13px] text-accent underline">
                    {r.url.replace(/^https?:\/\//, "")}
                  </a>
                  <span className="text-[13px] text-muted">
                    {r.ownerEmail} · {r.products} products
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 text-xs font-bold">
                  <span className={`rounded-md px-2 py-1 ${r.active ? "bg-pta-bg text-pta-fg" : "bg-nonpta-bg text-nonpta-fg"}`}>{r.active ? "Active" : "Band (suspended)"}</span>
                  <span className="rounded-md bg-soft px-2 py-1">{PLAN_LABEL[r.plan] ?? r.plan}</span>
                  <span className={`rounded-md px-2 py-1 ${expired ? "bg-nonpta-bg text-nonpta-fg" : "bg-soft"}`}>
                    {expired ? "Expire ho gaya" : "Expiry"}: {fmtDate(r.expires)}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" className={btnSmall} disabled={pending} onClick={() => start(async () => { await setShopActiveAction(r.id, !r.active); router.refresh(); })}>
                  {r.active ? "Shop band karein" : "Shop chalu karein"}
                </button>
                {reset?.id === r.id ? (
                  <form
                    className="flex flex-wrap items-center gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      start(async () => {
                        const res = await resetOwnerPasswordAction(r.id, reset.password);
                        if (res.ok) setReset({ ...reset, done: true });
                        else setError(res.error);
                      });
                    }}
                  >
                    <input aria-label="Naya password" value={reset.password} onChange={(e) => setReset({ id: r.id, password: e.target.value })} className={`${inputCls} h-11 w-44 font-mono`} />
                    <button type="submit" className={btnSmall} disabled={pending}>
                      Set karein
                    </button>
                    {reset.done && <span className="text-sm font-bold text-pta-fg">Ho gaya. Owner ko bhej dein.</span>}
                  </form>
                ) : (
                  <button type="button" className={btnSmall} onClick={() => setReset({ id: r.id, password: makePassword() })}>
                    Password reset
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
