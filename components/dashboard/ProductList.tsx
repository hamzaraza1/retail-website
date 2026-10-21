"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  deleteProductAction,
  duplicateProductAction,
  setProductStockAction,
  setProductVisibleAction,
} from "@/app/(app)/dashboard/actions";
import { formatPrice } from "@/lib/format";
import { PhonePlaceholder } from "@/components/storefront/PhonePlaceholder";
import { btnSmall, inputCls } from "./ui";

export type ProductRow = {
  id: string;
  name: string;
  categoryId: string | null;
  categoryName: string | null;
  cover: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  variants: number;
  inStock: boolean;
  visible: boolean;
  featured: boolean;
  url: string;
};

const priceRange = (r: ProductRow) =>
  r.minPrice === null
    ? "—"
    : r.minPrice === r.maxPrice
      ? formatPrice(r.minPrice)
      : `${formatPrice(r.minPrice)} – ${(r.maxPrice ?? 0).toLocaleString("en-PK")}`;

export function ProductList({ rows, categories }: { rows: ProductRow[]; categories: { id: string; name: string }[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const shown = rows.filter(
    (r) =>
      (!q || r.name.toLowerCase().includes(q.trim().toLowerCase())) &&
      (!cat || (cat === "none" ? !r.categoryId : r.categoryId === cat)),
  );

  function act(id: string, fn: () => Promise<{ ok: boolean; error?: string } & Record<string, unknown>>, after?: (res: unknown) => void) {
    setBusy(id);
    setError(null);
    start(async () => {
      const res = await fn();
      setBusy(null);
      if (!res.ok) setError(res.error ?? "Kuch ghalat ho gaya.");
      else {
        after?.(res);
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2 rounded-[18px] bg-white p-3">
        <input
          id="product-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Naam se dhoondein…"
          aria-label="Product dhoondein"
          className={`${inputCls} flex-[2_1_200px]`}
        />
        <select id="product-category" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category" className={`${inputCls} flex-[1_1_160px]`}>
          <option value="">Saari categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          <option value="none">Bina category</option>
        </select>
      </div>

      {error && (
        <p role="alert" className="m-0 rounded-input bg-nonpta-bg px-3.5 py-3 text-sm font-bold text-nonpta-fg">
          {error}
        </p>
      )}

      <p className="m-0 text-sm text-muted" aria-live="polite">
        {shown.length} / {rows.length} products
      </p>

      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
        {shown.map((r) => (
          <li key={r.id} className={`flex flex-col gap-3 rounded-card bg-white p-3.5 sm:flex-row sm:items-center ${busy === r.id && pending ? "opacity-60" : ""}`}>
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-soft">
                {r.cover ? <Image src={r.cover} alt="" fill sizes="64px" className="object-cover" /> : <PhonePlaceholder className="w-[34%] border-2" />}
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <Link href={`/dashboard/products/${r.id}`} className="truncate font-bold text-ink hover:text-accent">
                  {r.name}
                </Link>
                <span className="text-[13px] text-muted">
                  {r.categoryName ?? "Bina category"} · {priceRange(r)}
                  {r.variants > 1 ? ` · ${r.variants} variants` : ""}
                </span>
                <span className="flex flex-wrap gap-1.5 text-xs font-bold">
                  {r.visible ? (
                    <span className="rounded-md bg-pta-bg px-2 py-0.5 text-pta-fg">Live</span>
                  ) : (
                    <span className="rounded-md bg-soft px-2 py-0.5 text-muted">Draft · chhupa hua</span>
                  )}
                  {!r.inStock && <span className="rounded-md bg-nonpta-bg px-2 py-0.5 text-nonpta-fg">Stock khatam</span>}
                  {r.featured && <span className="rounded-md bg-accent/10 px-2 py-0.5 text-ink">Featured</span>}
                </span>
              </div>
            </div>

            {confirmDelete === r.id ? (
              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Delete confirm">
                <span className="text-sm font-bold">Pakka delete karein?</span>
                <button type="button" className={`${btnSmall} border-nonpta-fg text-nonpta-fg`} onClick={() => act(r.id, () => deleteProductAction(r.id), () => setConfirmDelete(null))}>
                  Haan, delete
                </button>
                <button type="button" className={btnSmall} onClick={() => setConfirmDelete(null)}>
                  Nahi
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex h-11 cursor-pointer items-center gap-2 rounded-input border border-line-strong px-3 text-sm font-bold">
                  <input
                    type="checkbox"
                    role="switch"
                    checked={r.inStock}
                    onChange={(e) => act(r.id, () => setProductStockAction(r.id, e.target.checked))}
                    className="h-5 w-5 accent-[var(--accent)]"
                  />
                  Stock mein
                </label>
                <Link href={`/dashboard/products/${r.id}`} className={btnSmall}>
                  Edit
                </Link>
                <details className="relative">
                  <summary className={`${btnSmall} cursor-pointer list-none`} aria-label={`${r.name}: aur options`}>
                    •••
                  </summary>
                  <div className="absolute right-0 z-10 mt-1 flex w-48 flex-col rounded-input border border-line bg-white p-1 shadow-lg">
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex h-11 items-center rounded-lg px-3 text-sm hover:bg-soft">
                      Shop par dekhein ↗
                    </a>
                    <button type="button" className="flex h-11 items-center rounded-lg px-3 text-left text-sm hover:bg-soft" onClick={() => act(r.id, () => setProductVisibleAction(r.id, !r.visible))}>
                      {r.visible ? "Chhupayein (draft)" : "Shop par dikhayein"}
                    </button>
                    <button
                      type="button"
                      className="flex h-11 items-center rounded-lg px-3 text-left text-sm hover:bg-soft"
                      onClick={() =>
                        act(r.id, () => duplicateProductAction(r.id), (res) => {
                          const id = (res as { data?: { id: string } }).data?.id;
                          if (id) router.push(`/dashboard/products/${id}`);
                        })
                      }
                    >
                      Duplicate (copy banayein)
                    </button>
                    <button type="button" className="flex h-11 items-center rounded-lg px-3 text-left text-sm text-nonpta-fg hover:bg-soft" onClick={() => setConfirmDelete(r.id)}>
                      Delete
                    </button>
                  </div>
                </details>
              </div>
            )}
          </li>
        ))}
      </ul>
      {shown.length === 0 && (
        <p className="m-0 rounded-card bg-white p-6 text-center text-muted">
          {rows.length ? "Is filter mein koi product nahi." : "Abhi koi product nahi. Upar se pehla product add karein."}
        </p>
      )}
    </div>
  );
}
