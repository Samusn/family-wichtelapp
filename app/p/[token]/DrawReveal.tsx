"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Eye, EyeOff, Gift } from "lucide-react";
import Animation, { type LottieHandle } from "@components/ui/Animation";
import Button from "@components/ui/Button";

const CONFETTI_COLORS = ["#f8c94a", "#ffe7a0", "#e0313f", "#22a06b", "#fff8ec"];

function celebrate() {
  const defaults = {
    colors: CONFETTI_COLORS,
    disableForReducedMotion: true,
    zIndex: 60,
  };
  confetti({
    ...defaults,
    particleCount: 120,
    spread: 80,
    origin: { y: 0.55 },
  });
  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 60,
      angle: 60,
      spread: 60,
      origin: { x: 0, y: 0.7 },
    });
    confetti({
      ...defaults,
      particleCount: 60,
      angle: 120,
      spread: 60,
      origin: { x: 1, y: 0.7 },
    });
  }, 250);
}

export default function DrawReveal({ drawnName }: { drawnName: string }) {
  const [stage, setStage] = useState<"closed" | "opening" | "open">("closed");
  const [hidden, setHidden] = useState(false);
  const gift = useRef<LottieHandle>(null);

  function open() {
    if (stage !== "closed") return;
    setStage("opening");
    gift.current?.play();
    setTimeout(finish, 1600);
  }

  function finish() {
    setStage((current) => {
      if (current !== "opening") return current;
      celebrate();
      return "open";
    });
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <AnimatePresence mode="wait">
        {stage !== "open" ? (
          <motion.button
            key="gift"
            type="button"
            onClick={open}
            disabled={stage === "opening"}
            exit={{ scale: 1.3, opacity: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={
              stage === "closed" ? { rotate: [0, -3, 3, -2, 0] } : undefined
            }
            className="relative w-56 h-56 rounded-3xl focus-visible:outline-2 focus-visible:outline-gold"
            aria-label="Geschenk öffnen"
          >
            <Animation
              name="gift-box"
              loop={false}
              autoplay={false}
              lottieRef={gift}
              onComplete={finish}
              className="w-full h-full"
            />
          </motion.button>
        ) : (
          <motion.div
            key="name"
            initial={{ scale: 0.4, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 14 }}
            className="relative w-full"
          >
            <p className="text-center text-sm font-semibold text-gold-soft/80 mb-3">
              Du beschenkst dieses Jahr
            </p>
            <div className="relative rounded-3xl bg-gradient-to-b from-berry to-berry-deep px-6 py-8 ring-4 ring-gold shadow-[0_0_40px_rgb(248_201_74/0.5)]">
              <div
                className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 bg-gold/80"
                aria-hidden
              />
              <div
                className="absolute inset-y-0 left-1/2 w-3 -translate-x-1/2 bg-gold/80"
                aria-hidden
              />
              <p
                className={`relative font-display font-bold text-5xl text-center text-gold-soft drop-shadow-[0_0_14px_rgb(248_201_74/0.8)] transition duration-300 break-words ${
                  hidden ? "blur-lg select-none" : ""
                }`}
              >
                <span className="rounded-2xl bg-berry-deep/90 px-4 py-1 box-decoration-clone">
                  {drawnName}
                </span>
              </p>
            </div>
            <div className="mt-3 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHidden((value) => !value)}
              >
                {hidden ? (
                  <Eye className="w-4 h-4" aria-hidden />
                ) : (
                  <EyeOff className="w-4 h-4" aria-hidden />
                )}
                {hidden ? "Name zeigen" : "Name verbergen"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {stage === "closed" && (
        <Button variant="festive" size="lg" onClick={open}>
          <Gift className="w-5 h-5" aria-hidden />
          Geschenk öffnen
        </Button>
      )}
    </div>
  );
}
