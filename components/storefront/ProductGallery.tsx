"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/lib/supabase/types";
import { PlayIcon } from "@/components/ui/icons";
import { PhonePlaceholder } from "./PhonePlaceholder";
import { TikTokEmbed } from "./TikTokEmbed";

/** Photos plus an optional "▶ Video" thumb; the TikTok player loads only after it is picked. */
export function ProductGallery({
  name,
  images,
  videoUrl,
  badges,
}: {
  name: string;
  images: ProductImage[];
  videoUrl: string | null;
  badges: React.ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const slides = images.length ? images : [null];
  const total = slides.length + (videoUrl ? 1 : 0);
  const isVideo = videoUrl !== null && index === slides.length;
  const current = isVideo ? null : slides[index];

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[22px] bg-soft">
        {isVideo ? (
          <div className="h-[92%]">
            <TikTokEmbed url={videoUrl} label={`${name} video`} className="h-full w-auto" />
          </div>
        ) : current ? (
          <Image
            src={current.url}
            alt={current.label ? `${name} — ${current.label}` : name}
            fill
            priority={index === 0}
            sizes="(max-width: 900px) 100vw, 600px"
            className="object-contain"
          />
        ) : (
          <PhonePlaceholder className="w-[30%]" />
        )}
        {!isVideo && <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">{badges}</div>}
      </div>

      {total > 1 && (
        <div className="grid grid-cols-6 gap-2.5">
          {slides.map((img, i) => (
            <button
              key={img?.id ?? i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={img?.label ? `${img.label} photo` : `Photo ${i + 1}`}
              aria-pressed={index === i}
              className={`relative flex aspect-square min-h-11 items-end justify-center overflow-hidden rounded-xl bg-soft pb-1.5 ${
                index === i ? "border-2 border-accent" : "border border-line"
              }`}
            >
              {img ? (
                <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
              ) : (
                <span className="text-[11px] font-bold text-muted">Photo</span>
              )}
            </button>
          ))}
          {videoUrl && (
            <button
              type="button"
              onClick={() => setIndex(slides.length)}
              aria-label="TikTok video"
              aria-pressed={isVideo}
              className={`flex aspect-square min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl bg-ink text-[11px] font-bold text-white ${
                isVideo ? "border-2 border-accent" : "border border-line"
              }`}
            >
              <PlayIcon size={16} />
              Video
            </button>
          )}
        </div>
      )}
    </div>
  );
}
