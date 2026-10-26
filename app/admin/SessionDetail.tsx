"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { getSession, archiveSession } from "@/app/actions/sessions";
import { addParticipant, removeParticipant } from "@/app/actions/participants";
import {
  performDraw,
  getDrawsForSession,
  getDrawStatusForSession,
} from "@/app/actions/draws";
import {
  Archive,
  ArrowRight,
  Check,
  ChevronLeft,
  Copy,
  Eye,
  EyeOff,
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

type DrawStatus = {
  id: string;
  giverName: string;
  isRevealed: boolean;
};

const REVEAL_MS = 15000;

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
  const [draws, setDraws] = useState<DrawStatus[]>([]);
  const [receivers, setReceivers] = useState<Record<string, string> | null>(
    null,
  );
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [newParticipantName, setNewParticipantName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadData = useCallback(async () => {
    const data = await getSession(sessionId);
    if (data) {
      setSession(data as unknown as Session);
      setDraws(await getDrawStatusForSession(sessionId));
    }
  }, [sessionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(
    () => () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    },
    [],
  );

  function hideReceivers() {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = null;
    setReceivers(null);
  }

  async function showReceivers() {
    if (
      !confirm(
        "Zuordnung wirklich anzeigen? Wenn du selbst mitmachst, siehst du auch, wen du gezogen hast.",
      )
    )
      return;
    const drawData = await getDrawsForSession(sessionId);
    setReceivers(
      Object.fromEntries(drawData.map((d) => [d.id, d.receiver.name])),
    );
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      hideTimer.current = null;
      setReceivers(null);
    }, REVEAL_MS);
  }

  async function handleAddParticipant(e: React.FormEvent) {
    e.preventDefault();
    if (!newParticipantName.trim() || !session) return;
    setLoading(true);
    const { error } = await addParticipant(
      session.id,
      newParticipantName.trim(),
    );
    if (error) showMessage(error);
    else setNewParticipantName("");
    await loadData();
    setLoading(false);
  }

  async function handleRemoveParticipant(participantId: string) {
    if (!confirm("Teilnehmer wirklich entfernen?")) return;
    setLoading(true);
    const { error } = await removeParticipant(participantId);
    if (error) showMessage(error);
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
    const { error } = await performDraw(session.id);
    await loadData();
    showMessage(error ?? "Ziehung erfolgreich!");
    setLoading(false);
  }

  async function handleArchive() {
    if (!session) return;
    if (
      !confirm("Session archivieren? Das kann NICHT rückgängig gemacht werden!")
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
        <LoaderCircle
          className="w-8 h-8 animate-spin text-gold"
          aria-label="Laden"
        />
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
          <CardTitle icon={<UserPlus aria-hidden />}>
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
        <CardTitle icon={<Users aria-hidden />}>
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle icon={<Gift aria-hidden />}>Ziehung</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={receivers ? hideReceivers : showReceivers}
            >
              {receivers ? (
                <EyeOff className="w-4 h-4" aria-hidden />
              ) : (
                <Eye className="w-4 h-4" aria-hidden />
              )}
              {receivers ? "Ausblenden" : "Zuordnung anzeigen"}
            </Button>
          </div>
          {receivers && (
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: REVEAL_MS / 1000, ease: "linear" }}
                className="h-full origin-left bg-gold"
                aria-hidden
              />
            </div>
          )}
          {draws.map((d) => (
            <div
              key={d.id}
              className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-2 text-sm ring-1 ring-white/10"
            >
              <span className="font-bold">{d.giverName}</span>
              {receivers ? (
                <>
                  <ArrowRight className="w-4 h-4 text-gold" aria-hidden />
                  <span className="font-bold">{receivers[d.id]}</span>
                </>
              ) : (
                <span
                  className={`ml-auto flex items-center gap-1.5 text-xs font-semibold ${
                    d.isRevealed ? "text-pine" : "text-cream/50"
                  }`}
                >
                  {d.isRevealed && <Check className="w-4 h-4" aria-hidden />}
                  {d.isRevealed ? "Los geöffnet" : "Noch nicht geöffnet"}
                </span>
              )}
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
