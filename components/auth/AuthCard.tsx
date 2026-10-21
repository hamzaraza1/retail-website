import { PLATFORM_NAME } from "@/lib/brand";

/** Centered card used by the login and forgot-password pages. */
export function AuthCard({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-soft px-4 py-10">
      <div className="flex w-full max-w-[420px] flex-col gap-6">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink font-display text-lg font-extrabold text-white"
          >
            {PLATFORM_NAME.charAt(0)}
          </span>
          <span className="font-display text-xl font-extrabold">{PLATFORM_NAME}</span>
        </div>
        <div className="flex flex-col gap-5 rounded-card-lg bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-1.5">
            <h1 className="m-0 font-display text-[28px] leading-tight font-extrabold">{title}</h1>
            <p className="m-0 text-[15px] text-muted">{intro}</p>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
