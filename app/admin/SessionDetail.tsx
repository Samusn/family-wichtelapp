"use client";

import { useState, useEffect, useCallback } from "react";
import { getSession, archiveSession } from "@/app/actions/sessions";
import { addParticipant, removeParticipant } from "@/app/actions/participants";
import { performDraw, getDrawsForSession } from "@/app/actions/draws";

type Participant = {
  id: string;
  name: string;
  urlToken: string;
};

type Draw = {
  id: string;
  giver: { name: string };
  receiver: { name: string };
};

type Session = {
  id: string;
  name: string;
  year: number;
  isActive: boolean;
  isArchived: boolean;
  participants: Participant[];
};

export default function SessionDetail({
  sessionId,
  onBack,
}: {
  sessionId: string;
  onBack: () => void;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [newParticipantName, setNewParticipantName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadData = useCallback(async () => {
    const data = await getSession(sessionId);
    if (data) {
      setSession(data as unknown as Session);
      const drawData = await getDrawsForSession(sessionId);
      setDraws(drawData as Draw[]);
    }
  }, [sessionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleAddParticipant(e: React.FormEvent) {
    e.preventDefault();
    if (!newParticipantName.trim() || !session) return;
    setLoading(true);
    await addParticipant(session.id, newParticipantName.trim());
    setNewParticipantName("");
    await loadData();
    setLoading(false);
  }

  async function handleRemoveParticipant(participantId: string) {
    if (!confirm("Teilnehmer wirklich entfernen?")) return;
    setLoading(true);
    await removeParticipant(participantId);
    await loadData();
    setLoading(false);
  }

  async function handleDraw() {
    if (!session) return;
    if (
      !confirm(
        "Wichtel-Ziehung starten? Das kann nicht rückgängig gemacht werden!",
      )
    )
      return;
    setLoading(true);
    try {
      await performDraw(session.id);
      await loadData();
      showMessage("Ziehung erfolgreich!");
    } catch (err) {
      showMessage(
        err instanceof Error ? err.message : "Fehler bei der Ziehung.",
      );
    }
    setLoading(false);
  }

  async function handleArchive() {
    if (!session) return;
    if (
      !confirm(
        "Session archivieren? Das kann NICHT rückgängig gemacht werden!",
      )
    )
      return;
    setLoading(true);
    await archiveSession(session.id);
    onBack();
  }

  function getParticipantLink(urlToken: string) {
    return `${window.location.origin}/p/${urlToken}`;
  }

  async function copyLink(urlToken: string) {
    await navigator.clipboard.writeText(getParticipantLink(urlToken));
    showMessage("Link kopiert!");
  }

  function showMessage(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/40">Laden...</p>
      </div>
    );
  }

  const isEditable = !session.isArchived;

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto flex flex-col gap-6">
      <button
        onClick={onBack}
        className="text-white/50 hover:text-white text-sm self-start transition"
      >
        ← Zurück
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">{session.name}</h1>
        {session.isArchived && (
          <span className="text-orange-400 text-sm border border-orange-400/30 px-3 py-1 rounded-full">
            Archiviert
          </span>
        )}
      </div>

      {message && (
        <div className="bg-green-500/20 border border-green-500/50 text-green-300 px-4 py-2 rounded-lg">
          {message}
        </div>
      )}

      {isEditable && (
        <section className="bg-white/10 backdrop-blur rounded-xl p-6 flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-white">
            Teilnehmer hinzufügen
          </h2>
          <form onSubmit={handleAddParticipant} className="flex gap-2">
            <input
              type="text"
              value={newParticipantName}
              onChange={(e) => setNewParticipantName(e.target.value)}
              placeholder="Name des Teilnehmers"
              className="flex-1 rounded-lg px-4 py-3 bg-white/10 text-white border border-white/20 focus:border-white/50 outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              +
            </button>
          </form>
        </section>
      )}

      <section className="bg-white/10 backdrop-blur rounded-xl p-6 flex flex-col gap-3">
        <h2 className="text-xl font-semibold text-white">
          Teilnehmer ({session.participants.length})
        </h2>
        {session.participants.length === 0 ? (
          <p className="text-white/40 text-sm">
            Noch keine Teilnehmer hinzugefügt.
          </p>
        ) : (
          session.participants.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3"
            >
              <span className="text-white">{p.name}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => copyLink(p.urlToken)}
                  className="text-blue-400 hover:text-blue-300 text-sm transition"
                >
                  Link kopieren
                </button>
                {isEditable && draws.length === 0 && (
                  <button
                    onClick={() => handleRemoveParticipant(p.id)}
                    className="text-red-400 hover:text-red-300 text-sm transition"
                  >
                    Entfernen
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </section>

      {draws.length > 0 && (
        <section className="bg-white/10 backdrop-blur rounded-xl p-6 flex flex-col gap-3">
          <h2 className="text-xl font-semibold text-white">Ziehung</h2>
          {draws.map((d) => (
            <div
              key={d.id}
              className="bg-white/5 rounded-lg px-4 py-2 text-white text-sm"
            >
              {d.giver.name} → {d.receiver.name}
            </div>
          ))}
        </section>
      )}

      {isEditable && (
        <div className="flex flex-col gap-3 mt-4">
          {draws.length === 0 && (
            <button
              onClick={handleDraw}
              disabled={loading || session.participants.length < 3}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
            >
              Wichtel-Ziehung starten
            </button>
          )}

          <button
            onClick={handleArchive}
            disabled={loading}
            className="bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-400 font-semibold py-3 rounded-lg transition"
          >
            Session archivieren (endgültig)
          </button>
        </div>
      )}
    </div>
  );
}
