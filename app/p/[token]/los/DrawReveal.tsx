"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Eye, EyeOff, Gift } from "lucide-react";
import { markDrawRevealed } from "@/app/actions/draws";
import Animation, { type LottieHandle } from "@components/ui/Animation";
import Button from "@components/ui/Button";

const CONFETTI_COLORS = ["#f8c94a", "#ffe7a0", "#e0313f", "#22a06b", "#fff8ec"];
const VISIBLE_MS = 5000;

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

export default function DrawReveal({
  token,
  drawnName,
  isRevealed,
}: {
  token: string;
  drawnName: string;
  isRevealed: boolean;
}) {
  const [stage, setStage] = useState<"closed" | "opening" | "open">(
    isRevealed ? "open" : "closed",
  );
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const gift = useRef<LottieHandle>(null);
  const opening = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    },
    [],
  );

  function show() {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setVisible(true);
    hideTimer.current = setTimeout(() => {
      hideTimer.current = null;
      setVisible(false);
    }, VISIBLE_MS);
  }

  function hide() {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = null;
    setVisible(false);
  }

  function open() {
    if (stage !== "closed") return;
    opening.current = true;
    setStage("opening");
    gift.current?.play();
    markDrawRevealed(token)
      .then(() => router.refresh())
      .catch(() => {});
    setTimeout(finish, 1600);
  }

  function finish() {
    if (!opening.current) return;
    opening.current = false;
    setStage("open");
    celebrate();
    show();
  }

  return (
    <div className="flex h-[22rem] w-full flex-col items-center justify-center gap-5">
      <AnimatePresence mode="wait" initial={false}>
        {stage !== "open" ? (
          <motion.div
            key="gift"
            exit={{ scale: 1.3, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-5"
          >
            <motion.button
              type="button"
              onClick={open}
              disabled={stage === "opening"}
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
            <Button
              variant="festive"
              size="lg"
              onClick={open}
              className={stage === "closed" ? "" : "invisible"}
            >
              <Gift className="w-5 h-5" aria-hidden />
              Geschenk öffnen
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="name"
            initial={{ scale: 0.4, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 14 }}
            className="flex w-full flex-col items-center"
          >
            <p className="text-sm font-semibold text-gold-soft/80 mb-2">
              Du beschenkst dieses Jahr
            </p>
            <div className="relative flex flex-col items-center w-full max-w-[280px]">
              <Animation name="snow-globe" className="w-56 h-56" />
              <div className="relative -mt-3 flex w-full justify-center items-center rounded-t-[50%] rounded-b-2xl bg-gradient-to-b from-berry to-berry-deep px-6 py-5 border-2 border-gold shadow-[0_0_30px_rgb(248_201_74/0.4)]">
                <p
                  className={`text-center font-display font-bold text-3xl leading-tight text-gold-soft drop-shadow-[0_0_14px_rgb(248_201_74/0.8)] transition duration-500 break-words ${
                    visible ? "" : "blur-[6px] select-none"
                  }`}
                  aria-hidden={!visible}
                >
                  {drawnName}
                </p>
                {visible && (
                  <motion.div
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: 0 }}
                    transition={{ duration: VISIBLE_MS / 1000, ease: "linear" }}
                    className="absolute inset-x-0 bottom-0 h-1 origin-left rounded-b-2xl bg-gold-soft"
                    aria-hidden
                  />
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={visible ? hide : show} className="mt-3">
              {visible ? (
                <EyeOff className="w-4 h-4" aria-hidden />
              ) : (
                <Eye className="w-4 h-4" aria-hidden />
              )}
              {visible ? "Name verbergen" : "Name zeigen"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
