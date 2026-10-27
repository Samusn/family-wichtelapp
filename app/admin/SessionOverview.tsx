"use client";

import { useState, useEffect, useCallback } from "react";
import { getAllSessions, createSession } from "@/app/actions/sessions";
import {
  ChevronRight,
  LogOut,
  Snowflake,
  Sparkles,
  TreePine,
  Users,
} from "lucide-react";
import SessionDetail from "./SessionDetail";
import Button from "@components/ui/Button";
import Card, { CardTitle } from "@components/ui/Card";
import DateTimePicker from "@components/ui/DateTimePicker";
import Input from "@components/ui/Input";
import Page from "@components/ui/Page";
import Title from "@components/ui/Title";

type Session = {
  id: string;
  name: string;
  year: number;
  isActive: boolean;
  isArchived: boolean;
  participants: { id: string; name: string }[];
};

export default function SessionOverview({
  onLogout,
}: {
  onLogout: () => void;
}) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const [newName, setNewName] = useState("");
  const [newCelebrationAt, setNewCelebrationAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadSessions = useCallback(async () => {
    const data = await getAllSessions();
    setSessions(data as Session[]);
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newCelebrationAt) return;
    setLoading(true);
    const result = await createSession(
      newName.trim(),
      new Date(newCelebrationAt).toISOString(),
    );
    setError(result.error ?? "");
    if (!result.error) {
      setNewName("");
      setNewCelebrationAt("");
    }
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
    <Page wide>
      <header className="flex items-center justify-between gap-4">
        <Title className="text-4xl">Admin</Title>
        <Button variant="ghost" size="sm" onClick={onLogout}>
          <LogOut className="w-4 h-4" aria-hidden />
          Abmelden
        </Button>
      </header>

      <Card className="flex flex-col gap-4">
        <CardTitle icon={<Sparkles aria-hidden />}>Neue Session</CardTitle>
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <Input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="z. B. Weihnachten 2026"
            required
          />
          <div className="flex flex-col gap-1.5">
            <span className="px-1 text-sm text-cream/70">
              Weihnachtsfeier (Datum und Uhrzeit)
            </span>
            <DateTimePicker
              value={newCelebrationAt}
              onChange={setNewCelebrationAt}
            />
          </div>
          {error && <p className="text-sm text-red-300">{error}</p>}
          <Button
            type="submit"
            variant="pine"
            disabled={loading || !newName.trim() || !newCelebrationAt}
          >
            Erstellen
          </Button>
        </form>
      </Card>

      {activeSessions.length > 0 && (
        <Card className="flex flex-col gap-3">
          <CardTitle icon={<TreePine aria-hidden />}>Aktive Sessions</CardTitle>
          {activeSessions.map((s) => (
            <SessionRow key={s.id} session={s} onOpen={setSelectedSessionId} />
          ))}
        </Card>
      )}

      {archivedSessions.length > 0 && (
        <Card className="flex flex-col gap-3 opacity-80">
          <CardTitle icon={<Snowflake aria-hidden />}>Archiv</CardTitle>
          {archivedSessions.map((s) => (
            <SessionRow key={s.id} session={s} onOpen={setSelectedSessionId} />
          ))}
        </Card>
      )}
    </Page>
  );
}

function SessionRow({
  session,
  onOpen,
}: {
  session: Session;
  onOpen: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onOpen(session.id)}
      className="group flex w-full items-center justify-between gap-3 rounded-2xl bg-white/5 px-4 py-3 text-left ring-1 ring-white/10 transition hover:bg-white/10"
    >
      <span className="font-bold">
        {session.name}{" "}
        <span className="font-normal text-cream/60">({session.year})</span>
      </span>
      <span className="flex items-center gap-1 text-sm text-cream/60">
        <Users className="w-4 h-4" aria-hidden />
        {session.participants.length}
        <ChevronRight
          className="w-4 h-4 transition group-hover:translate-x-0.5"
          aria-hidden
        />
      </span>
    </button>
  );
}
