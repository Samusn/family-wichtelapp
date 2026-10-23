"use client";

import { LottieSvg, type LottieHandle } from "lottie-react";

export type { LottieHandle };

export default function Animation({
  name,
  className = "",
  loop = true,
  autoplay = true,
  lottieRef,
  onComplete,
}: {
  name: "gift-box" | "santa" | "snow-globe" | "christmas-tenten" | "reindeer";
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  lottieRef?: React.Ref<LottieHandle>;
  onComplete?: () => void;
}) {
  return (
    <div className={`pointer-events-none ${className}`} aria-hidden>
      <LottieSvg
        src={`/lottie/${name}.json`}
        loop={loop}
        autoplay={autoplay}
        lottieRef={lottieRef}
        subscriptions={onComplete ? { complete: onComplete } : undefined}
        className="w-full h-full"
      />
    </div>
  );
}
