/** Whole-rupee price → "Rs. 148,000". */
export function formatPrice(pkr: number): string {
  return `Rs. ${Math.round(pkr).toLocaleString("en-PK")}`;
}

/** "iPhone 13 Used PTA" → "iphone-13-used-pta". */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const PTA_LABELS = {
  pta: "PTA",
  non_pta: "Non-PTA",
  na: "",
} as const;
