"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { changePasswordAction, saveShopSettingsAction } from "@/app/(app)/dashboard/actions";
import { resizeToWebp } from "@/lib/image-resize";
import type { ShopSettingsInput } from "@/lib/data/schemas";
import { btnPrimary, btnSmall, Card, inputCls, labelCls, PageHead } from "./ui";

export type SettingsState = {
  name: string;
  tagline: string;
  hero_title: string;
  hero_description: string;
  theme_color: string;
  logo_url: string;
  banner_url: string;
  whatsapp_number: string;
  phone: string;
  tiktok_url: string;
  instagram_url: string;
  address: string;
  maps_url: string;
  timings: string;
  footer_about: string;
  delivery_policy: string;
  return_policy: string;
  warranty_note: string;
  trust_items: { title: string; detail: string }[];
  seo_title: string;
  seo_description: string;
};

const THEMES = ["#1D4ED8", "#0F172A", "#B4530A", "#9F1D3A", "#0E7A3F", "#6D28D9"];

/** Shop settings (PLAN.md §5.6): header/banner, contact, visit + footer, trust strip, SEO. */
export function SettingsForm({ initial, shopUrl }: { initial: SettingsState; shopUrl: string }) {
  const router = useRouter();
  const [f, setF] = useState(initial);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [password, setPassword] = useState("");
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const set = <K extends keyof SettingsState>(k: K, v: SettingsState[K]) => setF((s) => ({ ...s, [k]: v }));
  const field = (k: keyof SettingsState, label: string, opts: { placeholder?: string; hint?: string; type?: string; rows?: number } = {}) => (
    <label className={labelCls}>
      {label}
      {opts.rows ? (
        <textarea
          id={k}
          rows={opts.rows}
          value={f[k] as string}
          placeholder={opts.placeholder}
          onChange={(e) => set(k, e.target.value as never)}
          className={`${inputCls} h-auto py-3`}
        />
      ) : (
        <input
          id={k}
          type={opts.type ?? "text"}
          value={f[k] as string}
          placeholder={opts.placeholder}
          onChange={(e) => set(k, e.target.value as never)}
          className={inputCls}
        />
      )}
      {opts.hint && <span className="text-[13px] font-normal text-muted">{opts.hint}</span>}
    </label>
  );

  async function pickImage(k: "logo_url" | "banner_url", files: FileList | null, max: number) {
    const file = files?.[0];
    if (!file) return;
    try {
      set(k, await resizeToWebp(file, max));
    } catch {
      setMsg({ ok: false, text: "Photo load nahi ho saki. JPG ya PNG try karein." });
    }
  }

  function save() {
    setMsg(null);
    start(async () => {
      const payload: ShopSettingsInput = { ...f, trust_items: f.trust_items.filter((t) => t.title.trim()) };
      const res = await saveShopSettingsAction(payload);
      setMsg(res.ok ? { ok: true, text: "Settings save ho gayin. Shop par foran nazar aayengi." } : { ok: false, text: res.error });
      if (res.ok) router.refresh();
      else window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shopUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const saveBtn = (
    <button type="button" className={btnPrimary} disabled={pending} onClick={save}>
      {pending ? "Save ho raha hai…" : "Save karein"}
    </button>
  );

  return (
    <>
      <PageHead title="Shop settings" actions={saveBtn} />
      {msg && (
        <p role={msg.ok ? "status" : "alert"} className={`m-0 rounded-input px-3.5 py-3 text-sm font-bold ${msg.ok ? "bg-pta-bg text-pta-fg" : "bg-nonpta-bg text-nonpta-fg"}`}>
          {msg.text}
        </p>
      )}

      <Card title="Aapki shop ka link" hint="TikTok bio aur WhatsApp status mein yahi link lagayein">
        <div className="flex flex-wrap items-center gap-2">
          <code className="min-w-0 flex-1 rounded-input bg-soft px-3.5 py-3 text-sm break-all select-all">{shopUrl}</code>
          <button type="button" className={btnSmall} onClick={copyLink}>
            {copied ? "Copy ho gaya ✓" : "Copy"}
          </button>
        </div>
      </Card>

      <Card title="Header aur banner">
        <div className="grid gap-3.5 sm:grid-cols-2">
          {field("name", "Shop ka naam")}
          {field("tagline", "Tagline", { placeholder: "New · Used · Accessories" })}
        </div>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 text-sm font-bold">
            Logo
            <div className="flex items-center gap-3">
              <span className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-soft text-xl">
                {f.logo_url ? <Image src={f.logo_url} alt="Logo" fill sizes="64px" className="object-cover" unoptimized /> : f.name.charAt(0)}
              </span>
              <label className={`${btnSmall} cursor-pointer`}>
                Logo chunein
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => pickImage("logo_url", e.target.files, 400)} />
              </label>
              {f.logo_url && (
                <button type="button" className={btnSmall} onClick={() => set("logo_url", "")}>
                  Hatayein
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1.5 text-sm font-bold">
            Banner (computer par hero ke saath)
            <div className="flex items-center gap-3">
              <span className="relative flex h-16 w-28 items-center justify-center overflow-hidden rounded-xl bg-soft text-xs font-normal text-muted">
                {f.banner_url ? <Image src={f.banner_url} alt="Banner" fill sizes="112px" className="object-cover" unoptimized /> : "Koi banner nahi"}
              </span>
              <label className={`${btnSmall} cursor-pointer`}>
                Banner chunein
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => pickImage("banner_url", e.target.files, 1600)} />
              </label>
              {f.banner_url && (
                <button type="button" className={btnSmall} onClick={() => set("banner_url", "")}>
                  Hatayein
                </button>
              )}
            </div>
          </div>
        </div>
        {field("hero_title", "Hero title", { rows: 2, hint: "Nayi line ke liye Enter dabayein" })}
        {field("hero_description", "Hero description", { rows: 3 })}
        <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
          <legend className="mb-2 text-sm font-bold">Theme color</legend>
          <div className="flex flex-wrap items-center gap-2">
            {THEMES.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Color ${c}`}
                aria-pressed={f.theme_color.toLowerCase() === c.toLowerCase()}
                onClick={() => set("theme_color", c)}
                className={`h-11 w-11 rounded-full border-4 ${f.theme_color.toLowerCase() === c.toLowerCase() ? "border-ink" : "border-white"}`}
                style={{ background: c }}
              />
            ))}
            <input aria-label="Apna color" type="color" value={f.theme_color} onChange={(e) => set("theme_color", e.target.value)} className="h-11 w-14 cursor-pointer rounded-input border border-line-strong bg-white p-1" />
          </div>
        </fieldset>
      </Card>

      <Card title="Contact">
        <div className="grid gap-3.5 sm:grid-cols-2">
          {field("whatsapp_number", "WhatsApp number", { placeholder: "0300 1234567", hint: "Orders isi number par aayenge", type: "tel" })}
          {field("phone", "Call ke liye number", { placeholder: "+92 300 1234567", type: "tel" })}
          {field("tiktok_url", "TikTok link", { placeholder: "https://www.tiktok.com/@…", type: "url" })}
          {field("instagram_url", "Instagram link", { placeholder: "https://www.instagram.com/…", type: "url" })}
        </div>
      </Card>

      <Card title="Dukaan ka pata aur footer">
        {field("address", "Address", { rows: 2, placeholder: "Shop no. 12, Mobile Market, Saddar\nKarachi" })}
        <div className="grid gap-3.5 sm:grid-cols-2">
          {field("maps_url", "Google Maps link", { type: "url", placeholder: "https://maps.app.goo.gl/…" })}
          {field("timings", "Timings", { placeholder: "Roz 12pm se 10pm, Jumma 3pm se 10pm" })}
        </div>
        {field("footer_about", "Shop ke baare mein (footer)", { rows: 2 })}
        <div className="grid gap-3.5 sm:grid-cols-2">
          {field("delivery_policy", "Delivery policy", { rows: 2 })}
          {field("return_policy", "Return / warranty policy", { rows: 2 })}
        </div>
        {field("warranty_note", "Warranty note", { placeholder: "7 din shop check warranty" })}
      </Card>

      <Card title="Trust strip" hint="Home page par 4 chhote boxes (jaise Checked phones, Cash on Delivery)">
        {f.trust_items.map((t, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1.6fr_auto]">
            <input aria-label={`Box ${i + 1} title`} value={t.title} placeholder="Title" onChange={(e) => set("trust_items", f.trust_items.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} className={inputCls} />
            <input aria-label={`Box ${i + 1} detail`} value={t.detail} placeholder="Detail" onChange={(e) => set("trust_items", f.trust_items.map((x, j) => (j === i ? { ...x, detail: e.target.value } : x)))} className={inputCls} />
            <button type="button" aria-label={`Box ${i + 1} hatayein`} className={`${btnSmall} h-[46px] text-nonpta-fg`} onClick={() => set("trust_items", f.trust_items.filter((_, j) => j !== i))}>
              ✕
            </button>
          </div>
        ))}
        {f.trust_items.length < 4 && (
          <button type="button" className={`${btnSmall} self-start`} onClick={() => set("trust_items", [...f.trust_items, { title: "", detail: "" }])}>
            + Box add
          </button>
        )}
      </Card>

      <Card title="SEO (home page)" hint="Google par shop ka title aur description">
        {field("seo_title", "Meta title", { placeholder: `${f.name} — New & Used Phones in Karachi` })}
        {field("seo_description", "Meta description", { rows: 2 })}
      </Card>

      <div className="flex justify-end">{saveBtn}</div>

      <Card title="Password badlein">
        <form
          className="flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setPwMsg(null);
            start(async () => {
              const res = await changePasswordAction(password);
              setPwMsg(res.ok ? { ok: true, text: "Password badal gaya." } : { ok: false, text: res.error });
              if (res.ok) setPassword("");
            });
          }}
        >
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            aria-label="Naya password"
            placeholder="Naya password (kam az kam 8)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputCls} flex-[1_1_220px]`}
          />
          <button type="submit" className={btnSmall} disabled={pending || password.length < 8}>
            Password badlein
          </button>
        </form>
        {pwMsg && <p className={`m-0 text-sm font-bold ${pwMsg.ok ? "text-pta-fg" : "text-nonpta-fg"}`}>{pwMsg.text}</p>}
      </Card>
    </>
  );
}
