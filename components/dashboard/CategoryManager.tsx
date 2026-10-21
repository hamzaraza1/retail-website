"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createCategoryAction,
  deleteCategoryAction,
  moveCategoryAction,
  updateCategoryAction,
} from "@/app/(app)/dashboard/actions";
import { btnPrimary, btnSmall, Card, inputCls } from "./ui";

type Row = {
  id: string;
  name: string;
  slug: string;
  description: string;
  showOnHome: boolean;
  visible: boolean;
  count: number;
};

/** Create, rename, reorder, hide and "show as home tab" (PLAN.md §5.4). */
export function CategoryManager({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<{ id: string; name: string; description: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) {
    setError(null);
    start(async () => {
      const res = await fn();
      if (!res.ok) return setError(res.error ?? "Kuch ghalat ho gaya.");
      after?.();
      router.refresh();
    });
  }

  return (
    <>
      <Card title="Nayi category" hint="Link khud ban jayega, jaise /c/used-phones">
        <form
          className="flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => createCategoryAction(name), () => setName(""));
          }}
        >
          <input
            id="new-category"
            aria-label="Category ka naam"
            placeholder="Jaise: Tablets"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${inputCls} flex-[1_1_220px]`}
          />
          <button type="submit" className={btnPrimary} disabled={pending || !name.trim()}>
            + Banayein
          </button>
        </form>
      </Card>

      {error && (
        <p role="alert" className="m-0 rounded-input bg-nonpta-bg px-3.5 py-3 text-sm font-bold text-nonpta-fg">
          {error}
        </p>
      )}

      <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
        {rows.map((c, i) => (
          <li key={c.id} className="flex flex-col gap-3 rounded-card bg-white p-4">
            {editing?.id === c.id ? (
              <form
                className="flex flex-col gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  run(() => updateCategoryAction(c.id, { name: editing.name, description: editing.description }), () => setEditing(null));
                }}
              >
                <input aria-label="Naam" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inputCls} autoFocus />
                <input
                  aria-label="Chhoti description"
                  placeholder="Category page par title ke neeche (optional)"
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className={inputCls}
                />
                <div className="flex gap-2">
                  <button type="submit" className={btnSmall} disabled={pending}>
                    Save
                  </button>
                  <button type="button" className={btnSmall} onClick={() => setEditing(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-bold">{c.name}</span>
                  <span className="text-[13px] text-muted">
                    /c/{c.slug} · {c.count} products
                  </span>
                  {c.description && <span className="text-[13px] text-muted">{c.description}</span>}
                </div>
                <div className="flex gap-1.5">
                  <button type="button" aria-label={`${c.name} upar`} className={`${btnSmall} w-11 px-0`} disabled={i === 0 || pending} onClick={() => run(() => moveCategoryAction(c.id, -1))}>
                    ↑
                  </button>
                  <button type="button" aria-label={`${c.name} neeche`} className={`${btnSmall} w-11 px-0`} disabled={i === rows.length - 1 || pending} onClick={() => run(() => moveCategoryAction(c.id, 1))}>
                    ↓
                  </button>
                  <button type="button" className={btnSmall} onClick={() => setEditing({ id: c.id, name: c.name, description: c.description })}>
                    Rename
                  </button>
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <label className="flex h-11 cursor-pointer items-center gap-2 rounded-input border border-line-strong px-3 text-sm font-bold">
                <input
                  type="checkbox"
                  role="switch"
                  checked={c.showOnHome}
                  onChange={(e) => run(() => updateCategoryAction(c.id, { show_on_home: e.target.checked }))}
                  className="h-5 w-5 accent-[var(--accent)]"
                />
                Home par tab
              </label>
              <label className="flex h-11 cursor-pointer items-center gap-2 rounded-input border border-line-strong px-3 text-sm font-bold">
                <input
                  type="checkbox"
                  role="switch"
                  checked={c.visible}
                  onChange={(e) => run(() => updateCategoryAction(c.id, { is_visible: e.target.checked }))}
                  className="h-5 w-5 accent-[var(--accent)]"
                />
                Shop par dikhayein
              </label>
              {confirmDelete === c.id ? (
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm">Products delete nahi honge, bas &quot;Bina category&quot; ho jayenge.</span>
                  <button type="button" className={`${btnSmall} text-nonpta-fg`} onClick={() => run(() => deleteCategoryAction(c.id), () => setConfirmDelete(null))}>
                    Haan, delete
                  </button>
                  <button type="button" className={btnSmall} onClick={() => setConfirmDelete(null)}>
                    Nahi
                  </button>
                </span>
              ) : (
                <button type="button" className={`${btnSmall} text-nonpta-fg`} onClick={() => setConfirmDelete(c.id)}>
                  Delete
                </button>
              )}
            </div>
          </li>
        ))}
      </ol>
      {rows.length === 0 && <p className="m-0 rounded-card bg-white p-6 text-center text-muted">Abhi koi category nahi. Upar se banayein.</p>}
    </>
  );
}
