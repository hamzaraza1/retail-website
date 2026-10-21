import type { PtaStatus } from "@/lib/supabase/types";

const TONES = {
  pta: "bg-pta-bg text-pta-fg",
  nonpta: "bg-nonpta-bg text-nonpta-fg",
  white: "bg-white text-ink",
  info: "bg-accent/10 text-ink",
} as const;

export function Badge({
  tone,
  pill = false,
  children,
}: {
  tone: keyof typeof TONES;
  pill?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-bold ${pill ? "rounded-full px-2.5 text-[13px]" : "rounded-md"} ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

export function PtaBadge({ status, long = false, pill = false }: { status: PtaStatus | null; long?: boolean; pill?: boolean }) {
  if (status === "pta") return <Badge tone="pta" pill={pill}>{long ? "PTA Approved" : "PTA"}</Badge>;
  if (status === "non_pta")
    return <Badge tone="nonpta" pill={pill}>{long ? "Non-PTA · SIM nahi chalegi" : "Non-PTA"}</Badge>;
  return null;
}
