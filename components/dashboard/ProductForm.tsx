"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createCategoryAction, saveProductAction } from "@/app/(app)/dashboard/actions";
import { BOX_ITEMS } from "@/lib/catalog";
import { slugify } from "@/lib/format";
import { resizeToWebp } from "@/lib/image-resize";
import type { ProductInput } from "@/lib/data/schemas";
import { findTemplate, SPEC_TEMPLATES } from "@/lib/spec-templates";
import type { ProductFormState } from "./productFormState";
import type { Condition, PtaStatus } from "@/lib/supabase/types";
import { btnPrimary, btnSecondary, btnSmall, Card, inputCls, labelCls, PageHead, Toggle } from "./ui";

const BRANDS = ["Apple", "Samsung", "Infinix", "Tecno", "Xiaomi", "Vivo", "Oppo", "Realme", "Google", "OnePlus", "Nokia", "Itel"];
const STORAGES = ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB"];
const RAMS = ["2GB", "3GB", "4GB", "6GB", "8GB", "12GB", "16GB"];
const WARRANTIES = ["7 din shop check warranty", "1 mahina shop warranty", "Official brand warranty", "Koi warranty nahi"];
const PHOTO_LABELS = ["Front", "Back", "Side", "Battery screenshot", "Box", "Accessories"];
const MAX_PHOTOS = 8;

const toInt = (s: string) => {
  const n = Number(s.replace(/[^\d]/g, ""));
  return s.trim() && Number.isFinite(n) ? n : null;
};

const tidy = (s: string) => s.trim();

function toPayload(f: ProductFormState, visible: boolean): ProductInput {
  return {
    id: f.id,
    category_id: f.category_id || null,
    brand: tidy(f.brand),
    model_name: tidy(f.model_name),
    slug: tidy(f.slug),
    condition: f.condition,
    condition_rating: f.condition_rating,
    battery_health: toInt(f.battery_health),
    repair_history: f.repair_history,
    description: f.description,
    has_box: f.has_box,
    box_contents: f.box_contents,
    warranty: f.warranty,
    colors: f.colors,
    features: f.features.filter((x) => x.title.trim()).map((x) => ({ title: x.title, detail: x.detail })),
    specs: f.specs.filter((s) => s.key.trim() && s.value.trim()),
    tiktok_video_url: f.tiktok_video_url,
    is_featured: f.is_featured,
    is_visible: visible,
    show_reviews: f.show_reviews,
    seo_title: f.seo_title,
    seo_description: f.seo_description,
    images: f.images.map((i) => ({ url: i.url, label: i.label })),
    variants: f.variants.map((v) => ({
      id: v.id,
      storage: v.storage,
      ram: v.ram,
      pta_status: v.pta_status,
      price: toInt(v.price) ?? 0,
      sale_price: toInt(v.sale_price),
      in_stock: v.in_stock,
    })),
  };
}

/** Add / edit product (design/Dashboard.dc.html, PLAN.md §5.2). */
export function ProductForm({
  initial,
  categories: initialCategories,
  shopName,
  shopHost,
  saved,
}: {
  initial: ProductFormState;
  categories: { id: string; name: string }[];
  shopName: string;
  shopHost: string;
  saved?: boolean;
}) {
  const router = useRouter();
  const [f, setF] = useState(initial);
  const [categories, setCategories] = useState(initialCategories);
  const [newCat, setNewCat] = useState<string | null>(null);
  const [color, setColor] = useState({ name: "", hex: "#1F2937" });
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(saved ? "Save ho gaya. Shop par foran nazar aayega." : null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [pending, start] = useTransition();

  const set = <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => setF((s) => ({ ...s, [key]: value }));
  const isUsed = f.condition === "used";
  const isNew = !f.id;
  const template = findTemplate(f.model_name);
  const specsEmpty = f.specs.every((s) => !s.value.trim());

  function onModel(value: string) {
    setF((s) => {
      const next = { ...s, model_name: value };
      const tpl = findTemplate(value);
      if (tpl && s.specs.every((x) => !x.value.trim())) {
        next.specs = tpl.map(([key, v]) => ({ key, value: v }));
        const name = Object.keys(SPEC_TEMPLATES).find((n) => n.toLowerCase() === value.trim().toLowerCase());
        if (name && !s.brand) next.brand = SPEC_TEMPLATES[name].brand;
      }
      return next;
    });
  }

  function updateList<K extends "variants" | "features" | "specs" | "images">(key: K, i: number, patch: Partial<ProductFormState[K][number]>) {
    setF((s) => ({ ...s, [key]: s[key].map((item, j) => (j === i ? { ...item, ...patch } : item)) }));
  }
  function removeAt<K extends "variants" | "features" | "specs" | "images" | "colors">(key: K, i: number) {
    setF((s) => ({ ...s, [key]: s[key].filter((_, j) => j !== i) }));
  }
  function movePhoto(i: number, dir: -1 | 1) {
    setF((s) => {
      const imgs = [...s.images];
      const j = i + dir;
      if (j < 0 || j >= imgs.length) return s;
      [imgs[i], imgs[j]] = [imgs[j], imgs[i]];
      return { ...s, images: imgs };
    });
  }

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    setPhotoBusy(true);
    setError(null);
    try {
      const room = MAX_PHOTOS - f.images.length;
      const picked = Array.from(files).slice(0, room);
      const urls = await Promise.all(picked.map((file) => resizeToWebp(file)));
      setF((s) => ({
        ...s,
        images: [...s.images, ...urls.map((url, k) => ({ url, label: PHOTO_LABELS[s.images.length + k] ?? "" }))],
      }));
      if (files.length > room) setError(`Zyada se zyada ${MAX_PHOTOS} photos. Baaqi chhor di gayi.`);
    } catch {
      setError("Photo load nahi ho saki. JPG ya PNG photo try karein.");
    } finally {
      setPhotoBusy(false);
    }
  }

  function addCategory() {
    const name = newCat?.trim();
    if (!name) return;
    start(async () => {
      const res = await createCategoryAction(name);
      if (!res.ok) return setError(res.error);
      setCategories((c) => [...c, { id: res.data.id, name: res.data.name }]);
      set("category_id", res.data.id);
      setNewCat(null);
    });
  }

  function save(visible: boolean) {
    setError(null);
    setNotice(null);
    start(async () => {
      const res = await saveProductAction(toPayload(f, visible));
      if (!res.ok) {
        setError(res.error);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      set("is_visible", visible);
      set("slug", res.data.slug);
      if (isNew) router.replace(`/dashboard/products/${res.data.id}?saved=1`);
      else {
        setNotice(visible ? "Publish ho gaya. Shop par foran nazar aayega." : "Draft save ho gaya. Shop par chhupa hua hai.");
        router.refresh();
      }
    });
  }

  // SEO fallbacks shown in the Google preview (same rule as lib/seo.ts).
  const firstPta = f.variants.find((v) => v.pta_status !== "na")?.pta_status;
  const autoTitle = `${[f.model_name || "Model", isUsed ? "Used" : f.condition === "open_box" ? "Open box" : "", firstPta === "pta" ? "PTA" : firstPta === "non_pta" ? "Non-PTA" : ""]
    .filter(Boolean)
    .join(" ")} Price in Karachi | ${shopName}`;
  const autoSlug = slugify([f.model_name, isUsed ? "used" : "", firstPta === "pta" ? "pta" : firstPta === "non_pta" ? "non-pta" : ""].filter(Boolean).join(" "));
  const shownTitle = f.seo_title || autoTitle;
  const shownDesc = f.seo_description || f.description || `${f.model_name} — WhatsApp par order karein, ${shopName}.`;
  const shownSlug = f.slug || autoSlug || "product";

  const actions = (
    <>
      <button type="button" className={btnSecondary} disabled={pending} onClick={() => save(false)}>
        Draft save
      </button>
      <button type="button" className={btnPrimary} disabled={pending} onClick={() => save(true)}>
        {pending ? "Save ho raha hai…" : f.is_visible && !isNew ? "Save + Publish" : "Publish karein"}
      </button>
    </>
  );

  return (
    <>
      <PageHead
        crumb={{ href: "/dashboard/products", label: "Products", current: isNew ? "Naya product" : f.model_name }}
        title={isNew ? "Naya product add karein" : `${initial.model_name} edit karein`}
        actions={actions}
      />

      {error && (
        <p role="alert" className="m-0 rounded-input bg-nonpta-bg px-3.5 py-3 text-sm font-bold text-nonpta-fg">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="m-0 flex flex-wrap items-center gap-2 rounded-input bg-pta-bg px-3.5 py-3 text-sm font-bold text-pta-fg">
          {notice}
          {f.is_visible && f.slug && (
            <a href={`//${shopHost}/p/${f.slug}`} target="_blank" rel="noopener noreferrer" className="underline">
              Shop par dekhein ↗
            </a>
          )}
        </p>
      )}

      <Card title="Photos aur video" hint={`Pehli photo cover banegi. Zyada se zyada ${MAX_PHOTOS} photos.`}>
        <ul className="m-0 grid list-none grid-cols-2 gap-2.5 p-0 sm:grid-cols-[repeat(auto-fill,minmax(130px,1fr))]">
          {f.images.map((img, i) => (
            <li key={img.url.slice(-40) + i} className="flex flex-col gap-1.5">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-soft">
                <Image src={img.url} alt={img.label || `Photo ${i + 1}`} fill sizes="160px" className="object-cover" unoptimized={img.url.startsWith("data:")} />
                {i === 0 && <span className="absolute top-1.5 left-1.5 rounded-md bg-ink px-2 py-0.5 text-[11px] font-bold text-white">Cover</span>}
              </div>
              <input
                aria-label={`Photo ${i + 1} label`}
                list="photo-labels"
                value={img.label}
                onChange={(e) => updateList("images", i, { label: e.target.value })}
                className={`${inputCls} h-10 text-sm`}
              />
              <div className="flex gap-1">
                <button type="button" aria-label="Pehle" disabled={i === 0} onClick={() => movePhoto(i, -1)} className={`${btnSmall} flex-1 px-0`}>
                  ←
                </button>
                <button type="button" aria-label="Baad mein" disabled={i === f.images.length - 1} onClick={() => movePhoto(i, 1)} className={`${btnSmall} flex-1 px-0`}>
                  →
                </button>
                <button type="button" aria-label={`Photo ${i + 1} hatayein`} onClick={() => removeAt("images", i)} className={`${btnSmall} flex-1 px-0 text-nonpta-fg`}>
                  ✕
                </button>
              </div>
            </li>
          ))}
          {f.images.length < MAX_PHOTOS && (
            <li>
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line-strong bg-white text-sm font-bold text-slate-700 hover:border-ink">
                {photoBusy ? "Photo tayyar ho rahi hai…" : "+ Photo add"}
                <span className="text-xs font-normal text-muted">Camera ya gallery</span>
                <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => addPhotos(e.target.files)} disabled={photoBusy} />
              </label>
            </li>
          )}
        </ul>
        <datalist id="photo-labels">
          {PHOTO_LABELS.map((l) => (
            <option key={l} value={l} />
          ))}
        </datalist>
        <label className={labelCls}>
          TikTok video link (optional)
          <input
            id="tiktok"
            type="url"
            inputMode="url"
            placeholder="https://www.tiktok.com/@…/video/…"
            value={f.tiktok_video_url}
            onChange={(e) => set("tiktok_video_url", e.target.value)}
            className={inputCls}
          />
          <span className="text-[13px] font-normal text-muted">Yeh video product page ki gallery mein photos ke saath chalegi</span>
        </label>
      </Card>

      <Card title="Basic info">
        <div className="grid gap-3.5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>
              Category
              <select id="category" value={f.category_id} onChange={(e) => set("category_id", e.target.value)} className={inputCls}>
                <option value="">Bina category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            {newCat === null ? (
              <button type="button" onClick={() => setNewCat("")} className="flex min-h-11 items-center self-start text-sm font-bold text-accent">
                + Nayi category banayein
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  autoFocus
                  aria-label="Nayi category ka naam"
                  placeholder="Jaise: Tablets"
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCategory())}
                  className={`${inputCls} flex-1`}
                />
                <button type="button" className={btnSmall} onClick={addCategory} disabled={pending}>
                  Banayein
                </button>
                <button type="button" className={btnSmall} onClick={() => setNewCat(null)}>
                  ✕
                </button>
              </div>
            )}
          </div>
          <label className={labelCls}>
            Brand
            <input id="brand" list="brands" value={f.brand} onChange={(e) => set("brand", e.target.value)} placeholder="Apple, Samsung…" className={inputCls} />
            <datalist id="brands">
              {BRANDS.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </label>
          <label className={labelCls}>
            Model name
            <input
              id="model"
              list="models"
              required
              value={f.model_name}
              onChange={(e) => onModel(e.target.value)}
              placeholder="Jaise: iPhone 13"
              className={inputCls}
            />
            <datalist id="models">
              {Object.entries(SPEC_TEMPLATES)
                .filter(([, t]) => !f.brand || t.brand.toLowerCase() === f.brand.trim().toLowerCase())
                .map(([name]) => (
                  <option key={name} value={name} />
                ))}
            </datalist>
          </label>
          <label className={labelCls}>
            Condition
            <select id="condition" value={f.condition} onChange={(e) => set("condition", e.target.value as Condition)} className={inputCls}>
              <option value="used">Used</option>
              <option value="new">New (Box pack)</option>
              <option value="open_box">Open box</option>
            </select>
          </label>
        </div>

        {isUsed && (
          <div className="flex flex-col gap-3 rounded-input bg-soft p-3.5">
            <span className="text-[13px] font-bold tracking-wide text-muted uppercase">Sirf used phone ke liye</span>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className={labelCls}>
                Condition rating
                <select id="rating" value={f.condition_rating} onChange={(e) => set("condition_rating", e.target.value)} className={inputCls}>
                  {["10/10", "9/10", "8/10", "7/10", "6/10"].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </label>
              <label className={labelCls}>
                Battery health %
                <input id="battery" inputMode="numeric" value={f.battery_health} onChange={(e) => set("battery_health", e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="87" className={inputCls} />
              </label>
              <label className={labelCls}>
                Repair history
                <input id="repair" value={f.repair_history} onChange={(e) => set("repair_history", e.target.value)} placeholder="Koi nahi" className={inputCls} />
              </label>
            </div>
          </div>
        )}

        <label className={labelCls}>
          Description
          <textarea
            id="description"
            rows={3}
            value={f.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Jaise: Bilkul saaf phone, koi scratch nahi. Face ID aur True Tone working."
            className={`${inputCls} h-auto py-3`}
          />
        </label>
      </Card>

      <Card
        title="Variants aur price"
        hint="Har storage aur PTA status ki alag price"
        action={
          <button
            type="button"
            className={btnSmall}
            onClick={() =>
              set("variants", [...f.variants, { storage: "", ram: "", pta_status: f.variants.at(-1)?.pta_status ?? "pta", price: "", sale_price: "", in_stock: true }])
            }
          >
            + Variant add
          </button>
        }
      >
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
          {f.variants.map((v, i) => (
            <li key={i} className="grid grid-cols-2 gap-2.5 rounded-input border border-line p-3 sm:grid-cols-[1fr_0.9fr_1.1fr_1.1fr_1fr_auto] sm:items-end">
              <label className={labelCls}>
                <span className="text-xs">Storage</span>
                <input aria-label={`Variant ${i + 1} storage`} list="storages" value={v.storage} onChange={(e) => updateList("variants", i, { storage: e.target.value })} placeholder="128GB" className={inputCls} />
              </label>
              <label className={labelCls}>
                <span className="text-xs">RAM</span>
                <input aria-label={`Variant ${i + 1} RAM`} list="rams" value={v.ram} onChange={(e) => updateList("variants", i, { ram: e.target.value })} placeholder="8GB" className={inputCls} />
              </label>
              <label className={labelCls}>
                <span className="text-xs">PTA</span>
                <select aria-label={`Variant ${i + 1} PTA`} value={v.pta_status} onChange={(e) => updateList("variants", i, { pta_status: e.target.value as PtaStatus })} className={inputCls}>
                  <option value="pta">PTA Approved</option>
                  <option value="non_pta">Non-PTA</option>
                  <option value="na">Lagu nahi</option>
                </select>
              </label>
              <label className={labelCls}>
                <span className="text-xs">Price (Rs.)</span>
                <input aria-label={`Variant ${i + 1} price`} inputMode="numeric" value={v.price} onChange={(e) => updateList("variants", i, { price: e.target.value.replace(/[^\d,]/g, "") })} placeholder="148,000" className={inputCls} />
              </label>
              <label className={labelCls}>
                <span className="text-xs">Sale price</span>
                <input aria-label={`Variant ${i + 1} sale price`} inputMode="numeric" value={v.sale_price} onChange={(e) => updateList("variants", i, { sale_price: e.target.value.replace(/[^\d,]/g, "") })} placeholder="—" className={inputCls} />
              </label>
              <div className="flex items-end gap-2">
                <label className="flex h-[46px] flex-1 cursor-pointer items-center gap-2 rounded-input border border-line-strong px-3 text-sm font-bold">
                  <input type="checkbox" role="switch" checked={v.in_stock} onChange={(e) => updateList("variants", i, { in_stock: e.target.checked })} className="h-5 w-5 accent-[var(--accent)]" />
                  Stock
                </label>
                <button type="button" aria-label={`Variant ${i + 1} hatayein`} disabled={f.variants.length === 1} onClick={() => removeAt("variants", i)} className={`${btnSmall} h-[46px] text-nonpta-fg`}>
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
        <datalist id="storages">
          {STORAGES.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        <datalist id="rams">
          {RAMS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>

        <div className="flex flex-col gap-2.5">
          <span className="text-sm font-bold">Colors</span>
          <ul className="m-0 flex list-none flex-wrap items-center gap-2 p-0">
            {f.colors.map((c, i) => (
              <li key={c.name + i} className="flex h-11 items-center gap-2 rounded-full border border-line-strong pr-1 pl-3 text-sm">
                <span aria-hidden="true" className="h-5 w-5 rounded-full border border-line-strong" style={{ background: c.hex }} />
                {c.name}
                <button type="button" aria-label={`${c.name} hatayein`} onClick={() => removeAt("colors", i)} className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-soft">
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <input aria-label="Color ka naam" placeholder="Jaise: Midnight" value={color.name} onChange={(e) => setColor({ ...color, name: e.target.value })} className={`${inputCls} max-w-[200px] flex-1`} />
            <input aria-label="Color" type="color" value={color.hex} onChange={(e) => setColor({ ...color, hex: e.target.value })} className="h-[46px] w-14 cursor-pointer rounded-input border border-line-strong bg-white p-1" />
            <button
              type="button"
              className={btnSmall}
              disabled={!color.name.trim()}
              onClick={() => {
                set("colors", [...f.colors, { name: color.name.trim(), hex: color.hex }]);
                setColor({ name: "", hex: color.hex });
              }}
            >
              + Color
            </button>
          </div>
        </div>
      </Card>

      <Card
        title="Key features"
        hint="Product page par tick ke saath dikhenge"
        action={
          <button type="button" className={btnSmall} onClick={() => set("features", [...f.features, { title: "", detail: "" }])}>
            + Feature add
          </button>
        }
      >
        {f.features.length === 0 && <p className="m-0 text-sm text-muted">Abhi koi feature nahi. Jaise: &quot;A15 Bionic chip — Games mein fast&quot;.</p>}
        {f.features.map((x, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1.4fr_auto]">
            <input aria-label={`Feature ${i + 1}`} placeholder="Feature" value={x.title} onChange={(e) => updateList("features", i, { title: e.target.value })} className={inputCls} />
            <input aria-label={`Feature ${i + 1} detail`} placeholder="Chhoti detail (optional)" value={x.detail} onChange={(e) => updateList("features", i, { detail: e.target.value })} className={inputCls} />
            <button type="button" aria-label={`Feature ${i + 1} hatayein`} onClick={() => removeAt("features", i)} className={`${btnSmall} h-[46px] text-nonpta-fg`}>
              ✕
            </button>
          </div>
        ))}
      </Card>

      <Card
        title="Specifications"
        hint="Brand aur model chunte hi basic specs khud bhar jayengi, aap edit kar sakte hain"
        action={
          template && !specsEmpty ? (
            <button type="button" className={btnSmall} onClick={() => set("specs", template.map(([key, value]) => ({ key, value })))}>
              {f.model_name} template se bharein
            </button>
          ) : undefined
        }
      >
        <div className="grid gap-2.5 sm:grid-cols-2">
          {f.specs.map((s, i) => (
            <div key={i} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] gap-2">
              <input aria-label={`Spec ${i + 1} naam`} value={s.key} onChange={(e) => updateList("specs", i, { key: e.target.value })} placeholder="Jaise: Processor" className={`${inputCls} px-2.5 font-bold`} />
              <input aria-label={`${s.key || `Spec ${i + 1}`} value`} value={s.value} onChange={(e) => updateList("specs", i, { value: e.target.value })} placeholder="Value" className={`${inputCls} px-2.5`} />
              <button type="button" aria-label={`${s.key || `Spec ${i + 1}`} hatayein`} onClick={() => removeAt("specs", i)} className={`${btnSmall} h-[46px] px-3 text-nonpta-fg`}>
                ✕
              </button>
            </div>
          ))}
        </div>
        <button type="button" className={`${btnSmall} self-start`} onClick={() => set("specs", [...f.specs, { key: "", value: "" }])}>
          + Spec add
        </button>
      </Card>

      <Card title="Box aur warranty">
        <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
          <legend className="mb-2 text-sm font-bold">Phone box ke saath hai?</legend>
          <div className="flex flex-wrap gap-2">
            {[
              [true, "With box"],
              [false, "Without box"],
            ].map(([val, label]) => (
              <label key={String(val)} className="flex h-11 cursor-pointer items-center gap-2 rounded-input border border-line-strong px-3.5 text-sm font-bold">
                <input type="radio" name="has_box" checked={f.has_box === val} onChange={() => set("has_box", val as boolean)} className="h-4.5 w-4.5 accent-[var(--accent)]" />
                {label as string}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
          <legend className="mb-2 text-sm font-bold">Saath mein kya milega</legend>
          <div className="flex flex-wrap gap-2">
            {BOX_ITEMS.map((item) => (
              <label key={item.id} className="flex h-11 cursor-pointer items-center gap-2 rounded-input border border-line-strong px-3.5 text-sm font-bold">
                <input
                  type="checkbox"
                  checked={f.box_contents.includes(item.id)}
                  onChange={(e) =>
                    set("box_contents", e.target.checked ? [...f.box_contents, item.id] : f.box_contents.filter((x) => x !== item.id))
                  }
                  className="h-4.5 w-4.5 accent-[var(--accent)]"
                />
                {item.id === "bill" ? "Bill / receipt" : item.label}
              </label>
            ))}
          </div>
        </fieldset>
        <label className={labelCls}>
          Warranty
          <input id="warranty" list="warranties" value={f.warranty} onChange={(e) => set("warranty", e.target.value)} className={inputCls} />
          <datalist id="warranties">
            {WARRANTIES.map((w) => (
              <option key={w} value={w} />
            ))}
          </datalist>
        </label>
      </Card>

      <Card title="SEO (Google search)" hint="Khali chhorein toh product ke naam aur description se khud ban jayega">
        <label className={labelCls}>
          <span className="flex justify-between">
            Meta title <span className={`font-normal ${f.seo_title.length > 60 ? "text-nonpta-fg" : "text-muted"}`}>{f.seo_title.length} / 60</span>
          </span>
          <input id="seo-title" value={f.seo_title} maxLength={70} onChange={(e) => set("seo_title", e.target.value)} placeholder={autoTitle} className={inputCls} />
        </label>
        <label className={labelCls}>
          <span className="flex justify-between">
            Meta description <span className={`font-normal ${f.seo_description.length > 160 ? "text-nonpta-fg" : "text-muted"}`}>{f.seo_description.length} / 160</span>
          </span>
          <textarea id="seo-desc" rows={3} maxLength={200} value={f.seo_description} onChange={(e) => set("seo_description", e.target.value)} className={`${inputCls} h-auto py-3`} />
        </label>
        <label className={labelCls}>
          URL
          <span className="flex min-w-0 items-center overflow-hidden rounded-input border border-line-strong">
            <span className="shrink-0 bg-soft px-3 py-3 text-sm font-normal text-muted">{shopHost}/p/</span>
            <input
              id="slug"
              aria-label="URL slug"
              value={f.slug}
              placeholder={autoSlug || "iphone-13-used-pta"}
              onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              className="h-[46px] min-w-0 flex-1 px-3 text-[15px] font-normal outline-none"
            />
          </span>
        </label>
        <div className="flex flex-col gap-1 rounded-input border border-line p-4">
          <span className="text-[13px] font-bold text-muted">Google par aisa dikhega</span>
          <span className="truncate text-[13px] text-slate-600">
            {shopHost} › p › {shownSlug}
          </span>
          <span className="text-lg leading-snug text-[#1a0dab]">{shownTitle.length > 60 ? `${shownTitle.slice(0, 60)}…` : shownTitle}</span>
          <span className="text-sm leading-normal text-slate-600">{shownDesc.length > 160 ? `${shownDesc.slice(0, 160)}…` : shownDesc}</span>
        </div>
      </Card>

      <Card title="Shop par kaise dikhe">
        <Toggle checked={f.is_featured} onChange={(v) => set("is_featured", v)} label="Featured" hint="Home page par sabse upar" />
        <Toggle checked={f.show_reviews} onChange={(v) => set("show_reviews", v)} label="Reviews dikhayein" hint="Reviews section se chune hue reviews" />
        <p className="m-0 text-sm text-muted">
          {f.is_visible && !isNew ? "Abhi shop par live hai. " : "Abhi shop par chhupa hua hai. "}
          &quot;Draft save&quot; se chhupa rahega, &quot;Publish&quot; se shop par aa jayega. Delete karne ki zaroorat nahi.
        </p>
      </Card>

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap justify-end gap-2 border-t border-line bg-white/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <Link href="/dashboard/products" className={`${btnSecondary} mr-auto`}>
          Wapas
        </Link>
        {actions}
      </div>
    </>
  );
}
