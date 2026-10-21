// Small building blocks shared by dashboard pages (styles from design/Dashboard.dc.html).

import Link from "next/link";

export function PageHead({
  crumb,
  title,
  actions,
}: {
  crumb?: { href: string; label: string; current: string };
  title: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-1">
        {crumb && (
          <nav aria-label="Breadcrumb" className="text-sm text-muted">
            <Link href={crumb.href} className="text-ink underline-offset-2 hover:underline">
              {crumb.label}
            </Link>{" "}
            / <span aria-current="page">{crumb.current}</span>
          </nav>
        )}
        <h1 className="m-0 font-display text-[28px] leading-tight font-extrabold sm:text-[34px]">{title}</h1>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  title,
  hint,
  action,
  children,
}: {
  title?: string;
  hint?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3.5 rounded-[18px] bg-white p-4.5 sm:p-5.5">
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            {title && <h2 className="m-0 text-lg font-bold">{title}</h2>}
            {hint && <span className="text-sm text-muted">{hint}</span>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export const inputCls =
  "h-[46px] w-full min-w-0 rounded-input border border-line-strong bg-white px-3.5 text-[15px] font-normal text-ink";
export const labelCls = "flex min-w-0 flex-col gap-1.5 text-sm font-bold";
export const btnPrimary =
  "inline-flex h-[46px] items-center justify-center rounded-input bg-accent px-5 text-[15px] font-bold text-white hover:opacity-90 disabled:opacity-50";
export const btnSecondary =
  "inline-flex h-[46px] items-center justify-center rounded-input border border-line-strong bg-white px-4.5 text-[15px] font-bold text-ink hover:border-ink disabled:opacity-50";
export const btnSmall =
  "inline-flex h-11 items-center justify-center rounded-input border border-line-strong bg-white px-3 text-sm font-bold text-ink hover:border-ink disabled:opacity-50";

export function Toggle({
  checked,
  onChange,
  label,
  hint,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4">
      <span className="flex flex-col">
        <span className="font-bold">{label}</span>
        {hint && <span className="text-sm text-muted">{hint}</span>}
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-6 w-11 shrink-0 cursor-pointer accent-[var(--accent)]"
      />
    </label>
  );
}

export function ComingSoon({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <PageHead title={title} />
      <Card>
        <div className="flex flex-col gap-2 py-4">
          <p className="m-0 font-bold">Yeh hissa agle phase (Phase 3) mein banega.</p>
          <div className="text-[15px] leading-relaxed text-muted">{children}</div>
        </div>
      </Card>
    </>
  );
}
