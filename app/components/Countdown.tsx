"use client";

import { useEffect, useState } from "react";

type Time = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
};

function calc(target: number): Time {
  const diff = Math.max(0, target - Date.now());
  return {
    done: diff === 0,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const UNITS = [
  { key: "days", label: "Tage" },
  { key: "hours", label: "Std" },
  { key: "minutes", label: "Min" },
  { key: "seconds", label: "Sek" },
] as const;

export default function Countdown({
  celebrationAt,
}: {
  celebrationAt: string;
}) {
  const [time, setTime] = useState<Time | null>(null);

  useEffect(() => {
    const target = new Date(celebrationAt).getTime();
    const tick = () => {
      const next = calc(target);
      setTime(next);
      if (next.done) clearInterval(id);
    };
    const id = setInterval(tick, 1000);
    tick();
    return () => clearInterval(id);
  }, [celebrationAt]);

  if (!time) return null;

  return (
    <div className="flex flex-col items-center gap-2 mt-2 mb-3">
      <p className="text-[13px] uppercase tracking-widest text-cream/70">
        {time.done ? "Frohe Weihnachten!" : "Noch bis Weihnachten"}
      </p>
      <div className="flex items-center gap-2">
        {UNITS.map(({ key, label }, i) => (
          <div key={key} className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <span className="glass grid place-items-center w-14 h-14 rounded-xl text-2xl font-bold tabular-nums text-gold">
                {String(time[key]).padStart(2, "0")}
              </span>
              <span className="mt-1 text-[11px] font-semibold text-cream/70">
                {label}
              </span>
            </div>
            {i < UNITS.length - 1 && (
              <span className="text-xl font-bold text-cream/50 -mt-4">:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
