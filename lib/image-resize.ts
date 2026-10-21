// Client-side photo prep (CLAUDE.md): shrink to ~1200px and re-encode as WebP before upload,
// so pages stay fast on mobile data and storage stays small.

export async function resizeToWebp(file: File, maxSide = 1200, quality = 0.82): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const webp = canvas.toDataURL("image/webp", quality);
  // Safari < 16 can't encode WebP and silently returns PNG; fall back to JPEG there.
  return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/jpeg", quality);
}
