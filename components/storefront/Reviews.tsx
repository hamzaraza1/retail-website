import type { Review } from "@/lib/supabase/types";
import { StarIcon } from "@/components/ui/icons";
import { TikTokEmbed } from "./TikTokEmbed";

export function Stars({ rating }: { rating: number }) {
  return (
    <div role="img" aria-label={`${rating} stars`} className="flex gap-0.5 text-star">
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon key={i} className={i < rating ? "" : "opacity-25"} />
      ))}
    </div>
  );
}

const meta = (r: Review) => [r.location, r.product_label].filter(Boolean).join(" · ");

export function TextReviewCards({ reviews, avatars = true }: { reviews: Review[]; avatars?: boolean }) {
  return (
    <div className="grid gap-4 sm:grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
      {reviews.map((r) => (
        <figure key={r.id} className="m-0 flex flex-col gap-3.5 rounded-[18px] border border-line p-5.5">
          <Stars rating={r.rating ?? 5} />
          <blockquote className="m-0 text-base leading-relaxed">{r.text}</blockquote>
          <figcaption className="flex items-center gap-2.5">
            {avatars && (
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 font-bold text-accent"
              >
                {(r.location ?? r.customer_name ?? "?").charAt(0).toUpperCase()}
              </span>
            )}
            <span className="flex flex-col">
              <span className="text-sm font-bold">{r.customer_name}</span>
              <span className="text-[13px] text-muted">{meta(r)}</span>
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export function VideoReviewGrid({ reviews }: { reviews: Review[] }) {
  return (
    <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] sm:px-0">
      {reviews.map((r) => (
        <figure key={r.id} className="m-0 flex w-[62%] shrink-0 snap-start flex-col gap-2.5 sm:w-auto">
          {r.tiktok_url && <TikTokEmbed url={r.tiktok_url} label={r.product_label ?? "Customer review"} />}
          <figcaption className="flex flex-col gap-0.5">
            <span className="text-[15px] font-bold">{r.customer_name}</span>
            <span className="text-[13px] text-muted">{r.product_label}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
