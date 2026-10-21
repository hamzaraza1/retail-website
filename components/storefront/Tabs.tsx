"use client";

import { useId, useRef, useState } from "react";

/**
 * Accessible tabs. Panels are rendered on the server and passed in, so every tab's
 * products are in the HTML (good for SEO); inactive panels are just hidden.
 */
export function Tabs({ labels, panels }: { labels: string[]; panels: React.ReactNode[] }) {
  const [active, setActive] = useState(0);
  const id = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: React.KeyboardEvent) {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    const next = (active + step + labels.length) % labels.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className="flex flex-col gap-5">
      <div
        role="tablist"
        onKeyDown={onKeyDown}
        className="-mx-4 flex gap-2 overflow-x-auto border-b border-line px-4 sm:mx-0 sm:px-0"
      >
        {labels.map((label, i) => (
          <button
            key={label}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={active === i}
            aria-controls={`${id}-panel-${i}`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            className={`-mb-px h-12 shrink-0 border-b-[3px] px-4 text-base font-bold whitespace-nowrap ${
              active === i ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {panels.map((panel, i) => (
        <div
          key={i}
          role="tabpanel"
          id={`${id}-panel-${i}`}
          aria-labelledby={`${id}-tab-${i}`}
          hidden={active !== i}
        >
          {panel}
        </div>
      ))}
    </div>
  );
}
