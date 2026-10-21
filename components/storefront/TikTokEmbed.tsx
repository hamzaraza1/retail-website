"use client";

import { useState } from "react";
import { tiktokVideoId } from "@/lib/catalog";
import { PlayIcon } from "@/components/ui/icons";

/**
 * Vertical 9:16 TikTok player. Nothing from TikTok loads until the visitor taps play.
 * If the URL has no video id (e.g. a profile link), tapping opens it on TikTok instead.
 */
export function TikTokEmbed({
  url,
  label,
  className = "",
}: {
  url: string;
  label: string;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const videoId = tiktokVideoId(url);
  const frame = `flex aspect-[9/16] w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-[18px] bg-ink p-3 text-[13px] text-white ${className}`;

  if (playing && videoId) {
    return (
      <iframe
        src={`https://www.tiktok.com/embed/v2/${videoId}`}
        title={label}
        allow="encrypted-media; fullscreen"
        className={`${frame} p-0`}
      />
    );
  }

  const poster = (
    <>
      <span className="flex h-15 w-15 items-center justify-center rounded-full bg-white text-ink">
        <PlayIcon />
      </span>
      <span className="text-slate-300">{videoId ? "TikTok video" : "TikTok par dekhein ↗"}</span>
    </>
  );

  return videoId ? (
    <button type="button" aria-label={`Video chalayein: ${label}`} onClick={() => setPlaying(true)} className={`${frame} cursor-pointer`}>
      {poster}
    </button>
  ) : (
    <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`TikTok par dekhein: ${label}`} className={frame}>
      {poster}
    </a>
  );
}
