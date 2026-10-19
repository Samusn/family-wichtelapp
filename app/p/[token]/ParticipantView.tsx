"use client";

import { useState } from "react";

type Props = {
  participant: { id: string; name: string; token: string };
  session: { name: string; year: number; isArchived: boolean };
  drawnName: string | null;
};

export default function ParticipantView({
  participant,
  session,
  drawnName,
}: Props) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="min-h-screen p-6 max-w-md mx-auto flex flex-col gap-6 pt-16">
      <div>
        <p className="text-white/50 text-sm">{session.name}</p>
        <h1 className="text-3xl font-bold text-white">
          Hallo {participant.name}!
        </h1>
      </div>

      {drawnName ? (
        <section className="bg-white/10 backdrop-blur rounded-xl p-6 flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-white">Deine Ziehung</h2>
          {revealed ? (
            <p className="text-2xl font-bold text-green-400 text-center py-4">
              {drawnName}
            </p>
          ) : (
            <button
              onClick={() => setRevealed(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Aufdecken
            </button>
          )}
        </section>
      ) : (
        <section className="bg-white/10 backdrop-blur rounded-xl p-6">
          <p className="text-white/50">
            Die Ziehung hat noch nicht stattgefunden.
          </p>
        </section>
      )}

      {session.isArchived && (
        <p className="text-orange-400 text-sm text-center">
          Diese Session ist archiviert.
        </p>
      )}
    </div>
  );
}
