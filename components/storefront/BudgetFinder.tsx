"use client";

import Link from "next/link";
import { useState } from "react";
import type { FinderPhone } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/ui/icons";
import { PtaBadge } from "./Badge";

const BUDGETS = [
  { id: "u40", label: "40,000 tak", min: 0, max: 40_000 },
  { id: "40-70", label: "40k – 70k", min: 40_000, max: 70_000 },
  { id: "70-120", label: "70k – 1.2 lakh", min: 70_000, max: 120_000 },
  { id: "120+", label: "1.2 lakh se upar", min: 120_000, max: Infinity },
] as const;

type BudgetId = (typeof BUDGETS)[number]["id"];
const MAX_COMPARE = 3;

type Option = FinderPhone["options"][number];

/** Cheapest option of a phone that fits the budget and PTA need, if any. */
function fit(p: FinderPhone, budget: BudgetId, ptaOnly: boolean): Option | undefined {
  const b = BUDGETS.find((x) => x.id === budget)!;
  return p.options.find((o) => (!ptaOnly || o.pta === "pta") && o.price > b.min && o.price <= b.max);
}

/** Phones that fit, priciest first (most phone for the money). */
function matches(phones: FinderPhone[], budget: BudgetId, ptaOnly: boolean) {
  return phones
    .map((p) => ({ ...p, pick: fit(p, budget, ptaOnly) }))
    .filter((p): p is FinderPhone & { pick: Option } => !!p.pick)
    .sort((a, b) => b.pick.price - a.pick.price);
}

/**
 * Home section: pick a budget (and PTA need) → suggested phones → compare up to 3 side by side.
 * All rows and compare columns are rendered and toggled with `hidden`, so the markup stays
 * stable and readable without JavaScript.
 */
export function BudgetFinder({ phones, whatsappNumber }: { phones: FinderPhone[]; whatsappNumber: string }) {
  const [budget, setBudget] = useState<BudgetId>("40-70");
  const [ptaOnly, setPtaOnly] = useState(false);
  const shown = matches(phones, budget, ptaOnly);
  const [selected, setSelected] = useState<string[]>(() => shown.slice(0, 2).map((p) => p.id));

  function choose(nextBudget: BudgetId, nextPta: boolean) {
    setBudget(nextBudget);
    setPtaOnly(nextPta);
    setSelected(matches(phones, nextBudget, nextPta).slice(0, 2).map((p) => p.id));
  }

  function toggle(id: string) {
    setSelected((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id].slice(-MAX_COMPARE),
    );
  }

  const shownIds = new Set(shown.map((p) => p.id));
  // Price/PTA/memory shown for a phone: its fitting option, else its cheapest one.
  const pickOf = (p: FinderPhone) => shown.find((x) => x.id === p.id)?.pick ?? p.options[0];
  const compared = selected.filter((id) => shownIds.has(id));
  const order = [...shown, ...phones.filter((p) => !shownIds.has(p.id))];
  const budgetLabel = BUDGETS.find((b) => b.id === budget)!.label;

  const chip = (on: boolean) =>
    `flex h-11 shrink-0 items-center rounded-full border px-4 text-sm font-bold ${
      on ? "border-ink bg-ink text-white" : "border-line-strong bg-white text-ink hover:border-ink"
    }`;

  const rows: { label: string; value: (p: FinderPhone) => React.ReactNode }[] = [
    { label: "Price", value: (p) => <span data-price className="font-bold">{formatPrice(pickOf(p).price)}</span> },
    { label: "PTA", value: (p) => <span data-badge><PtaBadge status={pickOf(p).pta} /></span> },
    { label: "Condition", value: (p) => p.condition },
    { label: "RAM / Storage", value: (p) => <span data-memory>{pickOf(p).memory}</span> },
    { label: "Processor", value: (p) => p.specs.processor ?? "—" },
    { label: "Battery", value: (p) => p.specs.battery ?? "—" },
    { label: "Display", value: (p) => p.specs.display ?? "—" },
    { label: "Camera", value: (p) => p.specs.camera ?? "—" },
    { label: "Battery health", value: (p) => (p.batteryHealth != null ? `${p.batteryHealth}%` : p.condition === "New" ? "Naya phone" : "—") },
  ];

  return (
    <section id="budget" aria-labelledby="budget-title" className="mx-auto max-w-[1200px] scroll-mt-4 px-4 py-8">
      <div className="flex flex-col gap-5 rounded-card-lg bg-soft p-5 sm:p-8">
        <div className="flex flex-col gap-1.5">
          <h2 id="budget-title" className="m-0 font-display text-[28px] leading-tight font-extrabold sm:text-[34px]">
            Budget batayein, phone hum suggest karenge
          </h2>
          <p className="m-0 text-base text-muted">
            Apna budget chunein. Phir 2–3 phone chun kar unki details saath mein compare karein.
          </p>
        </div>

        <div className="flex flex-col gap-3" data-finder-controls>
          <div role="group" aria-label="Budget" className="-mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
            {BUDGETS.map((b) => (
              <button
                key={b.id}
                type="button"
                data-budget={b.id}
                data-min={b.min}
                data-max={Number.isFinite(b.max) ? b.max : ""}
                aria-pressed={budget === b.id}
                onClick={() => choose(b.id, ptaOnly)}
                className={chip(budget === b.id)}
              >
                {b.label}
              </button>
            ))}
          </div>
          <div role="group" aria-label="PTA" className="flex flex-wrap gap-2">
            {[
              [false, "PTA ya Non-PTA, koi bhi"],
              [true, "Sirf PTA approved"],
            ].map(([val, label]) => (
              <button
                key={String(val)}
                type="button"
                data-pta-only={String(val)}
                aria-pressed={ptaOnly === val}
                onClick={() => choose(budget, val as boolean)}
                className={chip(ptaOnly === val)}
              >
                {label as string}
              </button>
            ))}
          </div>
        </div>

        <p className="m-0 text-sm text-muted" aria-live="polite" data-finder-count>
          {shown.length ? `${shown.length} phone ${budgetLabel} mein` : `${budgetLabel} mein abhi koi phone nahi`}
        </p>

        <ul className="m-0 grid list-none gap-2.5 p-0 md:grid-cols-2" data-finder-list>
          {order.map((p) => {
            const on = compared.includes(p.id);
            return (
              <li
                key={p.id}
                hidden={!shownIds.has(p.id)}
                data-id={p.id}
                data-options={JSON.stringify(p.options)}
                className="flex flex-col gap-3 rounded-card border border-line bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <Link href={`/p/${p.slug}`} className="text-[16px] font-bold text-ink hover:text-accent">
                      {p.name}
                    </Link>
                    <span className="text-[13px] text-muted">
                      {p.condition} · <span data-memory>{pickOf(p).memory}</span>
                    </span>
                    <span className="text-[13px] text-muted">
                      {[p.specs.processor, p.specs.battery?.split(",")[0]].filter(Boolean).join(" · ")}
                    </span>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span data-price className="text-[17px] font-bold">
                      {formatPrice(pickOf(p).price)}
                    </span>
                    <span data-badge>
                      <PtaBadge status={pickOf(p).pta} />
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    data-compare={p.id}
                    aria-pressed={on}
                    onClick={() => toggle(p.id)}
                    className={`flex h-11 flex-1 items-center justify-center rounded-full border text-sm font-bold ${
                      on ? "border-accent bg-accent text-white" : "border-line-strong bg-white text-ink hover:border-ink"
                    }`}
                  >
                    {on ? "✓ Compare mein" : "+ Compare"}
                  </button>
                  <Link
                    href={`/p/${p.slug}`}
                    className="flex h-11 flex-1 items-center justify-center rounded-full bg-ink text-sm font-bold text-white"
                  >
                    Dekhein
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>

        {shown.length === 0 && (
          <a
            href={whatsappLink(whatsappNumber, `Assalam o Alaikum! Mera budget ${budgetLabel} hai. Koi achha phone suggest karein?`)}
            className="flex h-12 items-center gap-2 self-start rounded-full bg-whatsapp px-5 font-bold text-white"
            data-finder-empty
          >
            <WhatsAppIcon />
            WhatsApp par poochein
          </a>
        )}

        <div className="flex flex-col gap-3" data-compare-wrap>
          <h3 className="m-0 font-display text-[22px] font-extrabold">Compare karein</h3>
          <p className="m-0 text-sm text-muted" hidden={compared.length >= 2} data-compare-hint>
            Upar se kam az kam 2 phone chunein (zyada se zyada {MAX_COMPARE}).
          </p>
          <div className="overflow-x-auto rounded-card border border-line bg-white" hidden={compared.length < 2} data-compare-table>
            <table className="w-full table-fixed border-collapse text-[12px] [overflow-wrap:anywhere] sm:text-[14px]">
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="w-[24%] p-2 text-left text-[11px] font-medium text-muted sm:w-[20%] sm:p-3 sm:text-[13px]">
                    <span className="sr-only">Detail</span>
                  </th>
                  {phones.map((p) => (
                    <th key={p.id} scope="col" data-col={p.id} hidden={!compared.includes(p.id)} className="p-2 text-left align-bottom leading-snug font-bold sm:p-3">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label} className="border-b border-line last:border-0">
                    <th scope="row" className="p-2 text-left align-top text-[11px] font-medium text-muted sm:p-3 sm:text-[13px]">
                      {r.label}
                    </th>
                    {phones.map((p) => (
                      <td key={p.id} data-col={p.id} hidden={!compared.includes(p.id)} className="p-2 align-top leading-snug sm:p-3">
                        {r.value(p)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
