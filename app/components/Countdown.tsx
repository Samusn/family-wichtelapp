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
    <div className="flex flex-col items-center">
      <h1 className='text-2xl font-bold my-4'>Christmas</h1>
      <div className="card border rounded-lg shadow-md p-4 bg-white text-black">
        <p className="text-xl font-semibold">
          <span>{zeitBisWeihnachten}</span>{" "}
          <span className="text-lg italic">bis</span>
        </p>
        <p className="text-lg">Donnerstag, 25. Dezember</p>
      </div>
    </div>
  );
};

export default Countdown;
