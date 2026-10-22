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
  name: "gift-box" | "santa" | "snow-globe";
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  lottieRef?: React.Ref<LottieHandle>;
  onComplete?: () => void;
}) {
  return (
    <LottieSvg
      src={`/lottie/${name}.json`}
      loop={loop}
      autoplay={autoplay}
      lottieRef={lottieRef}
      subscriptions={onComplete ? { complete: onComplete } : undefined}
      className={`pointer-events-none ${className}`}
      aria-hidden
    />
  );
}
