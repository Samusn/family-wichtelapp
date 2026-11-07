import confetti from "canvas-confetti";

const CONFETTI_COLORS = ["#f8c94a", "#ffe7a0", "#e0313f", "#22a06b", "#fff8ec"];

export function celebrate() {
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
