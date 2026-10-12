"use client";

import { useState, useEffect, useCallback } from "react";
import { getAllSessions, createSession } from "@/app/actions/sessions";
import SessionDetail from "./SessionDetail";

type Session = {
  id: string;
  name: string;
  year: number;
  isActive: boolean;
  isArchived: boolean;
  participants: { id: string; name: string }[];
};

export default function SessionOverview() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const [newName, setNewName] = useState("");
  const [newYear, setNewYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const loadSessions = useCallback(async () => {
    const data = await getAllSessions();
    setSessions(data as Session[]);
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setLoading(true);
    await createSession(newName.trim(), newYear);
    setNewName("");
    await loadSessions();
    setLoading(false);
  }

  if (selectedSessionId) {
    return (
      <SessionDetail
        sessionId={selectedSessionId}
        onBack={() => {
          setSelectedSessionId(null);
          loadSessions();
        }}
      />
    );
  }

  const activeSessions = sessions.filter((s) => !s.isArchived);
  const archivedSessions = sessions.filter((s) => s.isArchived);

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto flex flex-col gap-8">
      <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>

      <section className="bg-white/10 backdrop-blur rounded-xl p-6 flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-white">Neue Session</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="z.B. Weihnachten 2026"
            className="rounded-lg px-4 py-3 bg-white/10 text-white border border-white/20 focus:border-white/50 outline-none"
          />
          <input
            type="number"
            value={newYear}
            onChange={(e) => setNewYear(Number(e.target.value))}
            className="rounded-lg px-4 py-3 bg-white/10 text-white border border-white/20 focus:border-white/50 outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
          >
            Session erstellen
          </button>
        </form>
      </section>

      {activeSessions.length > 0 && (
        <section className="bg-white/10 backdrop-blur rounded-xl p-6 flex flex-col gap-3">
          <h2 className="text-xl font-semibold text-white">Aktive Sessions</h2>
          {activeSessions.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSessionId(s.id)}
              className="flex items-center justify-between bg-white/5 hover:bg-white/10 rounded-lg px-4 py-3 transition text-left w-full"
            >
              <span className="text-white">
                {s.name} ({s.year})
              </span>
              <span className="text-white/40 text-sm">
                {s.participants.length} Teilnehmer →
              </span>
            </button>
          ))}
        </section>
      )}

      {archivedSessions.length > 0 && (
        <section className="bg-white/10 backdrop-blur rounded-xl p-6 flex flex-col gap-3">
          <h2 className="text-xl font-semibold text-white">Archiv</h2>
          {archivedSessions.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSessionId(s.id)}
              className="flex items-center justify-between bg-white/5 hover:bg-white/10 rounded-lg px-4 py-3 transition text-left w-full"
            >
              <span className="text-white/50">
                {s.name} ({s.year})
              </span>
              <span className="text-white/30 text-sm">
                {s.participants.length} Teilnehmer →
              </span>
            </button>
          ))}
        </section>
      )}
    </div>
  );
}
