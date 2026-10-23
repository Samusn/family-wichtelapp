"use client";

import { useEffect, useState } from "react";

const CHRISTMAS = new Date("2026-12-25T00:00:00");

type Time = { days: number; hours: number; minutes: number; seconds: number };

function calc(): Time {
  const diff = Math.max(0, CHRISTMAS.getTime() - Date.now());
  return {
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

export default function Countdown() {
  const [time, setTime] = useState<Time | null>(null);

  useEffect(() => {
    setTime(calc());
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null;

  return (
    <div className="flex flex-col items-center gap-2 mt-2 mb-3">
      <p className="text-[13px] uppercase tracking-widest text-cream/70">
        Noch bis Weihnachten
      </p>
      <div className="flex items-center gap-2">
        {UNITS.map(({ key, label }, i) => (
          <div key={key} className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <span className="glass grid place-items-center w-14 h-14 rounded-xl text-2xl font-bold tabular-nums text-gold">
                {String(time[key]).padStart(2, "0")}
              </span>
              <span className="mt-1 text-[11px] font-semibold text-cream/70">{label}</span>
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
