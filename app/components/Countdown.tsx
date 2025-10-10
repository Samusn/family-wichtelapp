"use client";

import { useEffect, useState } from "react";

const WEIHNACHTEN_DATUM = new Date("2025-12-25T00:00:00");

interface CountdownProps {
  variant?: "boxed" | "plain";
}

const Countdown: React.FC<CountdownProps> = ({ variant = "boxed" }) => {
  const [zeitBisWeihnachten, setZeitBisWeihnachten] = useState("");

  useEffect(() => {
    const berechneZeit = () => {
      const jetzt = new Date();
      const diff = WEIHNACHTEN_DATUM.getTime() - jetzt.getTime();
      const tage = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
      setZeitBisWeihnachten(`${tage} Tage`);
    };

    berechneZeit();
    const interval = setInterval(berechneZeit, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, []);

  // Boxed-Variante (Startseite)
  if (variant === "boxed") {
    return (
      <div className="w-[85%] text-center">
        <div className="rounded-lg shadow-md p-4 bg-red-600 text-white">
          <p className="text-xl sm:text-2xl font-semibold text-center leading-tight">
            <span className="text-base sm:text-lg italic">Noch</span>{" "}
            <span>{zeitBisWeihnachten}</span>{" "}
            <span className="text-base sm:text-lg italic">bis</span>
          </p>
          <p className="text-base sm:text-lg">wir gemeinsam feiern!</p>
        </div>
      </div>
    );
  }

  // Plain-Variante (Header)
  return (
    <p
      className="
        text-center text-red-600 font-semibold truncate
        text-sm sm:text-base md:text-lg
        max-w-[80%] sm:max-w-[60%]
      "
    >
      Noch {zeitBisWeihnachten} bis wir gemeinsam feiern!
    </p>
  );
};

export default Countdown;
