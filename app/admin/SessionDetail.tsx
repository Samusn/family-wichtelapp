"use client";

import { useState, useEffect, useCallback } from "react";
import { getSession, archiveSession } from "@/app/actions/sessions";
import { addParticipant, removeParticipant } from "@/app/actions/participants";
import { performDraw, getDrawsForSession } from "@/app/actions/draws";
import {
  Archive,
  ArrowRight,
  ChevronLeft,
  Copy,
  Gift,
  LoaderCircle,
  Lock,
  Plus,
  Shuffle,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import Button from "@components/ui/Button";
import Card, { CardTitle } from "@components/ui/Card";
import Input from "@components/ui/Input";
import Page from "@components/ui/Page";
import Title from "@components/ui/Title";

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
      <Page className="items-center justify-center">
        <LoaderCircle className="w-8 h-8 animate-spin text-gold" aria-label="Laden" />
      </Page>
    );
  }

  const isEditable = !session.isArchived;

  return (
    <Page wide>
      <Button variant="ghost" size="sm" onClick={onBack} className="self-start">
        <ChevronLeft className="w-4 h-4" aria-hidden />
        Zurück
      </Button>

      <header className="flex flex-wrap items-center justify-between gap-3">
        <Title className="text-4xl">{session.name}</Title>
        {session.isArchived && (
          <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm text-gold-soft ring-1 ring-white/15">
            <Lock className="w-4 h-4" aria-hidden />
            Archiviert
          </span>
        )}
      </header>

      {message && (
        <p className="rounded-2xl bg-pine/20 px-4 py-2 text-cream ring-1 ring-pine/50">
          {message}
        </p>
      )}

      {isEditable && (
        <Card className="flex flex-col gap-4">
          <CardTitle icon={<UserPlus className="w-5 h-5" aria-hidden />}>
            Teilnehmer hinzufügen
          </CardTitle>
          <form onSubmit={handleAddParticipant} className="flex gap-2">
            <Input
              type="text"
              value={newParticipantName}
              onChange={(e) => setNewParticipantName(e.target.value)}
              placeholder="Name des Teilnehmers"
            />
            <Button
              type="submit"
              variant="pine"
              disabled={loading}
              aria-label="Hinzufügen"
            >
              <Plus className="w-5 h-5" aria-hidden />
            </Button>
          </form>
        </Card>
      )}

      <Card className="flex flex-col gap-3">
        <CardTitle icon={<Users className="w-5 h-5" aria-hidden />}>
          Teilnehmer ({session.participants.length})
        </CardTitle>
        {session.participants.length === 0 ? (
          <p className="text-sm text-cream/60">
            Noch keine Teilnehmer hinzugefügt.
          </p>
        ) : (
          session.participants.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-2xl bg-white/5 px-4 py-2 ring-1 ring-white/10"
            >
              <span className="font-bold">{p.name}</span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyLink(p.urlToken)}
                >
                  <Copy className="w-4 h-4" aria-hidden />
                  Link
                </Button>
                {isEditable && draws.length === 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveParticipant(p.id)}
                    aria-label={`${p.name} entfernen`}
                    className="text-red-300 hover:text-red-200"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </Card>

      {draws.length > 0 && (
        <Card className="flex flex-col gap-3">
          <CardTitle icon={<Gift className="w-5 h-5" aria-hidden />}>
            Ziehung
          </CardTitle>
          {draws.map((d) => (
            <div
              key={d.id}
              className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-2 text-sm ring-1 ring-white/10"
            >
              <span className="font-bold">{d.giver.name}</span>
              <ArrowRight className="w-4 h-4 text-gold" aria-hidden />
              <span className="font-bold">{d.receiver.name}</span>
            </div>
          ))}
        </Card>
      )}

      {isEditable && (
        <div className="mt-2 flex flex-col gap-3">
          {draws.length === 0 && (
            <Button
              variant="festive"
              size="lg"
              onClick={handleDraw}
              disabled={loading || session.participants.length < 3}
            >
              <Shuffle className="w-5 h-5" aria-hidden />
              Wichtel-Ziehung starten
            </Button>
          )}

          <Button variant="danger" onClick={handleArchive} disabled={loading}>
            <Archive className="w-4 h-4" aria-hidden />
            Session archivieren (endgültig)
          </Button>
        </div>
      )}
    </Page>
  );
}
