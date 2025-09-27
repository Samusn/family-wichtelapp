"use client";

import { useEffect, useState } from "react";

const WEIHNACHTEN_DATUM = new Date("2025-12-25T00:00:00");

const Countdown: React.FC = () => {
  const [zeitBisWeihnachten, setZeitBisWeihnachten] = useState("");

  useEffect(() => {
    const berechneZeit = () => {
      const jetzt = new Date();
      const zeitDifferenz = WEIHNACHTEN_DATUM.getTime() - jetzt.getTime();
      const tage = Math.floor(zeitDifferenz / (1000 * 60 * 60 * 24));
      setZeitBisWeihnachten(`${tage} Tage`);
    };

    berechneZeit();
    const interval = setInterval(berechneZeit, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-[85%] text-center">
      <div className="rounded-lg shadow-md p-4 bg-red-600 text-white">
        <p className="text-2xl font-semibold text-center">
          <span className="text-lg italic">Noch</span>
          {" "}<span>{zeitBisWeihnachten}</span>{" "}
          <span className="text-lg italic">bis</span>
        </p>
        <p className="text-lg">wir gemeinsam feiern!</p>
      </div>
    </div>
  );
};

export default Countdown;
