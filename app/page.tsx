import { shopOrigin } from "@/lib/seo";

// Placeholder for the marketing site on the root domain (built later).
export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-4 px-4 py-12">
      <h1 className="m-0 font-display text-4xl leading-tight font-extrabold">
        Apni dukaan ki website, ek link mein
      </h1>
      <p className="m-0 text-base text-muted">
        Products, prices aur WhatsApp order — TikTok bio mein ek hi link.
      </p>
      <a
        href={shopOrigin("zaibmobiles")}
        className="flex h-12 items-center self-start rounded-full bg-ink px-5 font-bold text-white"
      >
        Demo shop dekhein: Zaib Mobiles
      </a>
    </main>
  );
}
