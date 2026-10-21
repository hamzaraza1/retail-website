// Built-in spec templates for popular phones (PLAN.md §5.2): picking brand + model in the
// dashboard pre-fills Specifications. Published manufacturer values; the shopkeeper can edit.
// Keys match the "Phone ki details" tiles and the home compare table.

export type SpecRow = [key: string, value: string];

export const SPEC_TEMPLATES: Record<string, { brand: string; specs: SpecRow[] }> = {
  "iPhone XS Max": { brand: "Apple", specs: [["Processor", "A12 Bionic"], ["Battery", "3174mAh, 18W"], ["Display", '6.5" Super Retina OLED'], ["Main camera", "12MP + 12MP 2x tele"], ["Front camera", "7MP"], ["OS", "iOS"], ["Network", "4G"]] },
  "iPhone 11": { brand: "Apple", specs: [["Processor", "A13 Bionic"], ["Battery", "3110mAh, 18W"], ["Display", '6.1" Liquid Retina LCD'], ["Main camera", "12MP + 12MP ultra-wide"], ["Front camera", "12MP"], ["OS", "iOS"], ["Network", "4G"]] },
  "iPhone 12 Pro": { brand: "Apple", specs: [["Processor", "A14 Bionic"], ["Battery", "2815mAh, 20W"], ["Display", '6.1" Super Retina XDR OLED'], ["Main camera", "12MP x3 (wide, ultra-wide, 2x tele) + LiDAR"], ["Front camera", "12MP"], ["OS", "iOS"], ["Network", "5G"]] },
  "iPhone 13": { brand: "Apple", specs: [["Processor", "A15 Bionic"], ["Battery", "3240mAh, 20W"], ["Display", '6.1" Super Retina XDR OLED'], ["Main camera", "12MP + 12MP ultra-wide"], ["Front camera", "12MP"], ["OS", "iOS"], ["Network", "5G"]] },
  "iPhone 14": { brand: "Apple", specs: [["Processor", "A15 Bionic"], ["Battery", "3279mAh, 20W"], ["Display", '6.1" Super Retina XDR OLED'], ["Main camera", "12MP + 12MP ultra-wide"], ["Front camera", "12MP"], ["OS", "iOS"], ["Network", "5G"]] },
  "iPhone 14 Pro Max": { brand: "Apple", specs: [["Processor", "A16 Bionic"], ["Battery", "4323mAh, 27W"], ["Display", '6.7" Super Retina XDR OLED, 120Hz'], ["Main camera", "48MP + 12MP ultra-wide + 12MP 3x tele"], ["Front camera", "12MP"], ["OS", "iOS"], ["Network", "5G"]] },
  "iPhone 15": { brand: "Apple", specs: [["Processor", "A16 Bionic"], ["Battery", "3349mAh, 20W"], ["Display", '6.1" Super Retina XDR OLED'], ["Main camera", "48MP + 12MP ultra-wide"], ["Front camera", "12MP"], ["OS", "iOS"], ["Network", "5G"]] },
  "iPhone 15 Pro Max": { brand: "Apple", specs: [["Processor", "A17 Pro"], ["Battery", "4441mAh, 27W"], ["Display", '6.7" Super Retina XDR OLED, 120Hz'], ["Main camera", "48MP + 12MP ultra-wide + 12MP 5x tele"], ["Front camera", "12MP"], ["OS", "iOS"], ["Network", "5G"]] },
  "Samsung Galaxy A15": { brand: "Samsung", specs: [["Processor", "Helio G99"], ["Battery", "5000mAh, 25W"], ["Display", '6.5" Super AMOLED, 90Hz'], ["Main camera", "50MP + 5MP ultra-wide + 2MP macro"], ["Front camera", "13MP"], ["OS", "Android 14 (One UI)"], ["Network", "4G"]] },
  "Samsung Galaxy A35 5G": { brand: "Samsung", specs: [["Processor", "Exynos 1380"], ["Battery", "5000mAh, 25W"], ["Display", '6.6" Super AMOLED, 120Hz'], ["Main camera", "50MP + 8MP ultra-wide + 5MP macro"], ["Front camera", "13MP"], ["OS", "Android 14 (One UI 6.1)"], ["Network", "5G"]] },
  "Samsung Galaxy A55 5G": { brand: "Samsung", specs: [["Processor", "Exynos 1480"], ["Battery", "5000mAh, 25W fast charging"], ["Display", '6.6" Super AMOLED, 120Hz'], ["Main camera", "50MP + 12MP ultra-wide + 5MP macro"], ["Front camera", "32MP"], ["OS", "Android 14 (One UI 6.1)"], ["Network", "5G"]] },
  "Galaxy S21 FE": { brand: "Samsung", specs: [["Processor", "Snapdragon 888"], ["Battery", "4500mAh, 25W"], ["Display", '6.4" Dynamic AMOLED 2X, 120Hz'], ["Main camera", "12MP + 12MP ultra-wide + 8MP 3x tele"], ["Front camera", "32MP"], ["OS", "Android (One UI)"], ["Network", "5G"]] },
  "Galaxy S22 Ultra": { brand: "Samsung", specs: [["Processor", "Snapdragon 8 Gen 1"], ["Battery", "5000mAh, 45W"], ["Display", '6.8" Dynamic AMOLED 2X, 120Hz'], ["Main camera", "108MP + 12MP ultra-wide + 10MP 3x + 10MP 10x"], ["Front camera", "40MP"], ["OS", "Android (One UI)"], ["Network", "5G"], ["S Pen", "Built-in"]] },
  "Google Pixel 6a": { brand: "Google", specs: [["Processor", "Google Tensor"], ["Battery", "4410mAh, 18W"], ["Display", '6.1" OLED, 60Hz'], ["Main camera", "12.2MP + 12MP ultra-wide"], ["Front camera", "8MP"], ["OS", "Android"], ["Network", "5G"]] },
  "Google Pixel 7": { brand: "Google", specs: [["Processor", "Google Tensor G2"], ["Battery", "4355mAh, 20W"], ["Display", '6.3" OLED, 90Hz'], ["Main camera", "50MP + 12MP ultra-wide"], ["Front camera", "10.8MP"], ["OS", "Android"], ["Network", "5G"]] },
  "Infinix Note 40": { brand: "Infinix", specs: [["Processor", "Helio G99 Ultimate"], ["Battery", "5000mAh, 45W + 20W wireless"], ["Display", '6.78" AMOLED, 120Hz'], ["Main camera", "108MP + 2MP + 2MP"], ["Front camera", "32MP"], ["OS", "Android 14 (XOS 14)"], ["Network", "4G"]] },
  "Tecno Spark 30": { brand: "Tecno", specs: [["Processor", "Helio G91"], ["Battery", "5000mAh, 18W"], ["Display", '6.78" IPS LCD, 90Hz'], ["Main camera", "64MP"], ["Front camera", "13MP"], ["OS", "Android 14 (HiOS 14)"], ["Network", "4G"]] },
  "Redmi Note 13": { brand: "Xiaomi", specs: [["Processor", "Snapdragon 685"], ["Battery", "5000mAh, 33W"], ["Display", '6.67" AMOLED, 120Hz'], ["Main camera", "108MP + 8MP ultra-wide + 2MP macro"], ["Front camera", "16MP"], ["OS", "Android (HyperOS)"], ["Network", "4G"]] },
  "Redmi Note 14": { brand: "Xiaomi", specs: [["Processor", "Helio G99-Ultra"], ["Battery", "5500mAh, 33W"], ["Display", '6.67" AMOLED, 120Hz'], ["Main camera", "108MP + 2MP + 2MP"], ["Front camera", "20MP"], ["OS", "Android 14 (HyperOS)"], ["Network", "4G"]] },
};

/** Default spec rows for a new phone with no template. */
export const EMPTY_PHONE_SPECS: SpecRow[] = [
  ["Processor", ""],
  ["Battery", ""],
  ["Display", ""],
  ["Main camera", ""],
  ["Front camera", ""],
];

/** Case/spacing-insensitive lookup, e.g. "iphone 13" → the "iPhone 13" template. */
export function findTemplate(model: string): SpecRow[] | null {
  const key = model.trim().toLowerCase().replace(/\s+/g, " ");
  if (!key) return null;
  const hit = Object.entries(SPEC_TEMPLATES).find(([name]) => name.toLowerCase() === key);
  return hit ? hit[1].specs : null;
}
