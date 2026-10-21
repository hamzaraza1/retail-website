import Link from "next/link";

export default function ShopNotFound() {
  return (
    <main className="mx-auto flex min-h-[60dvh] max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="m-0 font-display text-3xl font-extrabold">Yeh page nahi mila</h1>
      <p className="m-0 text-muted">Ho sakta hai yeh product ab available na ho.</p>
      <Link href="/" className="flex h-12 items-center rounded-full bg-ink px-5 font-bold text-white">
        Shop ka home page
      </Link>
    </main>
  );
}
