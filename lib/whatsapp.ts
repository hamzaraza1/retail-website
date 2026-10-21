import { formatPrice } from "./format";

/** Stored format: 923XXXXXXXXX (country code, no "+", no leading 0). */
const WA_NUMBER = /^923\d{9}$/;

export function isValidWhatsAppNumber(value: string): boolean {
  return WA_NUMBER.test(value);
}

/** Accepts "0300 1234567", "+92 300 1234567", "923001234567" → "923001234567", or null. */
export function normalizeWhatsAppNumber(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("0092")) digits = digits.slice(2);
  else if (digits.startsWith("03")) digits = `92${digits.slice(1)}`;
  else if (digits.startsWith("3") && digits.length === 10) digits = `92${digits}`;
  return isValidWhatsAppNumber(digits) ? digits : null;
}

type OrderMessage = {
  name: string;
  /** e.g. ["128GB", "PTA"]; empty parts are dropped. */
  options: string[];
  price: number;
  url: string;
};

/** Pre-filled message, format from PLAN.md §4.4. */
export function orderMessage({ name, options, price, url }: OrderMessage): string {
  const opts = options.filter(Boolean).join(", ");
  const title = opts ? `${name} (${opts})` : name;
  return `Assalam o Alaikum! Mujhe yeh phone chahiye:\n\n${title}\n${formatPrice(price)}\n${url}`;
}

export function whatsappLink(number: string, text?: string): string {
  const base = `https://wa.me/${number}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
