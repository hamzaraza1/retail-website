import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { PLATFORM_NAME } from "@/lib/brand";

export const metadata: Metadata = { title: `Password bhool gaye | ${PLATFORM_NAME}`, robots: { index: false } };

// Accounts are created and reset by the admin. Once Supabase Auth is connected this page
// can send a reset link by email instead.
export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Password bhool gaye?"
      intro={`Fikar na karein. ${PLATFORM_NAME} team aapka password naya set kar degi.`}
    >
      <ol className="m-0 flex list-decimal flex-col gap-2 pl-5 text-[15px] leading-relaxed">
        <li>{PLATFORM_NAME} team ko WhatsApp karein aur apni shop ka naam batayein.</li>
        <li>Team aapko naya password bhejegi.</li>
        <li>Naye password se login karein. Settings mein ja kar usay badal bhi sakte hain.</li>
      </ol>
      <Link href="/login" className="flex h-12 items-center justify-center rounded-full bg-ink font-bold text-white">
        Login par wapas jayein
      </Link>
    </AuthCard>
  );
}
