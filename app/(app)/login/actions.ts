"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { endSession, findUserByEmail, homeFor, startSession, verifyPassword } from "@/lib/auth";

export type LoginState = { error?: string; email?: string };

const WINDOW_MS = 15 * 60_000;
const MAX_ATTEMPTS = 10;
const attempts = new Map<string, { count: number; reset: number }>();

/** Per IP+email limit on failed logins (per server instance). */
function tooMany(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.reset < now) return false;
  return entry.count >= MAX_ATTEMPTS;
}
function recordFailure(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.reset < now) attempts.set(key, { count: 1, reset: now + WINDOW_MS });
  else entry.count += 1;
}

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Email aur password dono likhein.", email };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const key = `${ip}|${email.toLowerCase()}`;
  if (tooMany(key)) return { error: "Bohat zyada koshishein. 15 minute baad dobara try karein.", email };

  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    recordFailure(key);
    return { error: "Email ya password ghalat hai.", email };
  }

  attempts.delete(key);
  await startSession(user);
  redirect(homeFor(user));
}

export async function logout() {
  await endSession();
  redirect("/login");
}
