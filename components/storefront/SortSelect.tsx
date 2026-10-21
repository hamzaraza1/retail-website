"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  ["newest", "Naye pehle"],
  ["price_asc", "Price: kam se zyada"],
  ["price_desc", "Price: zyada se kam"],
] as const;

export function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams);
    if (e.target.value === "newest") params.delete("sort");
    else params.set("sort", e.target.value);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <label className="flex items-center gap-2 text-sm font-bold">
      Sort
      <select
        value={value}
        onChange={onChange}
        className="h-11 rounded-input border border-line-strong bg-white px-3 text-[15px] font-normal text-ink"
      >
        {OPTIONS.map(([v, label]) => (
          <option key={v} value={v}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
