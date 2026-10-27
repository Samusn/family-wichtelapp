"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { markDrawRevealed } from "@/app/actions/draws";
import Animation from "@components/ui/Animation";
import Button from "@components/ui/Button";

const CONFETTI_COLORS = ["#f8c94a", "#ffe7a0", "#e0313f", "#22a06b", "#fff8ec"];
const VISIBLE_MS = 5000;
const SHAKE_MS = 2600;
const FLAKE_COUNT = 32;

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

type Flake = {
  left: number;
  top: number;
  size: number;
  rise: number;
  fall: number;
  drift: number;
  duration: number;
  delay: number;
};

function createFlakes(): Flake[] {
  return Array.from({ length: FLAKE_COUNT }, () => ({
    left: Math.random() * 100,
    top: 35 + Math.random() * 55,
    size: 2 + Math.random() * 4,
    rise: 30 + Math.random() * 60,
    fall: 20 + Math.random() * 50,
    drift: (Math.random() - 0.5) * 40,
    duration: 1.8 + Math.random() * 0.8,
    delay: Math.random() * 0.4,
  }));
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
  const [stage, setStage] = useState<"closed" | "shaking" | "open">(
    isRevealed ? "open" : "closed",
  );
  const [flakes, setFlakes] = useState<Flake[]>([]);
  const [justDrawn, setJustDrawn] = useState(false);
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const shakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (shakeTimer.current) clearTimeout(shakeTimer.current);
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

  function shake() {
    if (stage !== "closed") return;
    setStage("shaking");
    setFlakes(createFlakes());
    navigator.vibrate?.([60, 40, 60, 40, 90]);
    markDrawRevealed(token)
      .then(() => router.refresh())
      .catch(() => {});
    shakeTimer.current = setTimeout(finish, SHAKE_MS);
  }

  function finish() {
    shakeTimer.current = null;
    setJustDrawn(true);
    setStage("open");
    celebrate();
    show();
  }

  const closed = stage === "closed";
  const shaking = stage === "shaking";

  return (
    <div className="flex h-[28rem] w-full flex-col items-center justify-center">
      <p className="text-sm font-semibold text-gold-soft/80">
        {closed
          ? "Wen beschenkst du dieses Jahr?"
          : shaking
            ? "Das Los wird gezogen …"
            : "Du beschenkst dieses Jahr"}
      </p>
      <motion.button
        type="button"
        onClick={shake}
        disabled={!closed}
        aria-label="Kugel schütteln"
        animate={
          shaking
            ? {
                rotate: [0, -14, 12, -10, 8, -5, 3, 0],
                x: [0, -10, 9, -7, 5, -3, 1, 0],
              }
            : closed
              ? { rotate: [0, -3, 3, -2, 0], x: 0 }
              : { rotate: 0, x: 0 }
        }
        transition={
          shaking
            ? { duration: 1.6, ease: "easeOut" }
            : closed
              ? { duration: 0.8, repeat: Infinity, repeatDelay: 2 }
              : { duration: 0.3 }
        }
        className="relative flex flex-col items-center origin-bottom rounded-full focus-visible:outline-2 focus-visible:outline-gold disabled:cursor-default"
      >
        <span className="relative z-10 block w-72 h-72">
          <Animation name="snow-globe" className="w-full h-full" />
          <span className="pointer-events-none absolute left-[7.35%] top-[6.45%] h-[86.9%] w-[86.9%] overflow-hidden rounded-full">
            {shaking &&
              flakes.map((flake, i) => (
                <motion.span
                  key={i}
                  className="absolute rounded-full bg-white shadow-[0_0_6px_rgb(255_255_255/0.8)]"
                  style={{
                    left: `${flake.left}%`,
                    top: `${flake.top}%`,
                    width: flake.size,
                    height: flake.size,
                  }}
                  initial={{ y: 0, x: 0, opacity: 0 }}
                  animate={{
                    y: [0, -flake.rise, flake.fall - flake.rise / 2],
                    x: [0, flake.drift, flake.drift / 2],
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration: flake.duration,
                    delay: flake.delay,
                    ease: ["easeOut", "easeIn"],
                  }}
                  aria-hidden
                />
              ))}
            <span
              className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_32%_24%,rgb(255_255_255/0.55),rgb(255_255_255/0.12)_18%,transparent_40%),radial-gradient(circle_at_72%_80%,rgb(255_255_255/0.12),transparent_30%)] shadow-[inset_0_-24px_40px_rgb(20_10_7/0.45),inset_0_10px_24px_rgb(255_255_255/0.25)] ring-2 ring-inset ring-white/35"
              aria-hidden
            />
          </span>
        </span>
        <span className="relative -mt-8 block w-60 rounded-t-[40%] rounded-b-2xl bg-gradient-to-b from-gold-soft via-gold to-[#7a4a10] px-3 pt-6 pb-3 shadow-[0_10px_24px_rgb(0_0_0/0.45),inset_0_2px_0_rgb(255_255_255/0.5)]">
          <span className="flex h-16 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-berry to-berry-deep px-3 shadow-[inset_0_2px_6px_rgb(0_0_0/0.5)] ring-1 ring-gold-soft/60">
            <AnimatePresence mode="wait" initial={false}>
              {stage === "open" ? (
                <motion.span
                  key="name"
                  initial={
                    justDrawn
                      ? { opacity: 0, scale: 0.8, filter: "blur(12px)" }
                      : false
                  }
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                >
                  <span
                    className={`block px-2 text-center font-display font-bold text-4xl leading-tight text-gold-soft [text-shadow:0_1px_2px_rgb(20_10_7/0.9),0_0_12px_rgb(248_201_74/0.6)] transition-[filter] duration-500 line-clamp-2 break-words ${
                      visible ? "" : "blur-[6px] select-none"
                    }`}
                    aria-hidden={!visible}
                  >
                    {drawnName}
                  </span>
                </motion.span>
              ) : (
                <motion.span
                  key="unknown"
                  exit={{
                    opacity: 0,
                    scale: 1,
                    transition: { duration: 0.2 },
                  }}
                  animate={
                    shaking
                      ? {
                          scale: [1, 1.15, 1],
                          transition: { duration: 0.6, repeat: Infinity },
                        }
                      : { scale: 1 }
                  }
                  className="font-display font-bold text-3xl text-shimmer"
                  aria-hidden
                >
                  ?
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </span>
      </motion.button>
      <div className="h-1 w-32 overflow-hidden rounded-full">
        {visible && (
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: VISIBLE_MS / 1000, ease: "linear" }}
            className="h-full origin-left rounded-full bg-gold-soft"
            aria-hidden
          />
        )}
      </div>
      <div className="mt-3 flex h-14 items-center">
        {stage === "open" ? (
          <Button variant="ghost" size="sm" onClick={visible ? hide : show}>
            {visible ? (
              <EyeOff className="w-4 h-4" aria-hidden />
            ) : (
              <Eye className="w-4 h-4" aria-hidden />
            )}
            {visible ? "Name verbergen" : "Name zeigen"}
          </Button>
        ) : (
          <Button
            variant="festive"
            size="lg"
            onClick={shake}
            className={shaking ? "invisible" : ""}
          >
            <Sparkles className="w-5 h-5" aria-hidden />
            Kugel schütteln
          </Button>
        )}
      </div>
    </div>
  );
}
