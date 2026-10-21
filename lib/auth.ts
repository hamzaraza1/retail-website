// Email + password sessions for shopkeepers and the super-admin.
// Accounts are created by the admin (no self sign-up). Demo mode keeps users in the
// in-memory store; with Supabase this becomes Supabase Auth.

import "server-only";
import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { store, type User } from "@/lib/data/store";

const COOKIE = "sb_session";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 days

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") throw new Error("Missing env var SESSION_SECRET.");
  return "dev-only-session-secret-change-me";
}

const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("base64url");

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, expected.length);
  return timingSafeEqual(actual, expected);
}

export function findUserByEmail(email: string): User | undefined {
  const e = email.trim().toLowerCase();
  return store.users.find((u) => u.email.toLowerCase() === e);
}

export async function startSession(user: User) {
  const expires = Math.floor(Date.now() / 1000) + MAX_AGE;
  const value = `${user.id}.${expires}`;
  (await cookies()).set(COOKIE, `${value}.${sign(value)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

/** The signed-in user, or null. Verifies signature and expiry on every call. */
export async function getUser(): Promise<User | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const i = raw.lastIndexOf(".");
  const value = raw.slice(0, i);
  const sig = Buffer.from(raw.slice(i + 1));
  const good = Buffer.from(sign(value));
  if (sig.length !== good.length || !timingSafeEqual(sig, good)) return null;
  const [id, expires] = value.split(".");
  if (Number(expires) < Date.now() / 1000) return null;
  return store.users.find((u) => u.id === id) ?? null;
}

/** For dashboard pages and actions: the owner's shop id, or redirect to login. */
export async function requireOwner(): Promise<User & { shopId: string }> {
  const user = await getUser();
  if (!user) redirect("/login");
  if (user.role === "admin") redirect("/admin");
  if (!user.shopId) redirect("/login");
  return user as User & { shopId: string };
}

export async function requireAdmin(): Promise<User> {
  const user = await getUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}

export const homeFor = (user: User) => (user.role === "admin" ? "/admin" : "/dashboard");
