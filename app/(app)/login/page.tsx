import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { getUser, homeFor } from "@/lib/auth";
import { PLATFORM_NAME } from "@/lib/brand";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: `Login | ${PLATFORM_NAME}`, robots: { index: false } };

export default async function LoginPage() {
  const user = await getUser();
  if (user) redirect(homeFor(user));

  return (
    <AuthCard title="Apni dukaan mein login karein" intro="Wohi email aur password jo aapko account banate waqt diya gaya tha.">
      <LoginForm />
      <p className="m-0 border-t border-line pt-4 text-center text-sm text-muted">
        Naya account chahiye? {PLATFORM_NAME} team se WhatsApp par rabta karein.
      </p>
    </AuthCard>
  );
}
