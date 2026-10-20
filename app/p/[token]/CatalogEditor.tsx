"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Ban, Check, CircleAlert, Heart, LoaderCircle } from "lucide-react";
import {
  savePreferences,
  type Preferences,
  type Sentiment,
} from "@/app/actions/catalog";
import { CATALOG, NOTE_MAX_LENGTH } from "@/lib/catalog";
import CategoryIcon from "@/app/components/CategoryIcon";

type Selection = Record<string, { sentiment: Sentiment; tags: string[] }>;

const RETRY_DELAYS = [2000, 5000, 15000];

function toSelection(preferences: Preferences): Selection {
  return Object.fromEntries(
    preferences.choices.map(({ categoryId, sentiment, tags }) => [
      categoryId,
      { sentiment, tags },
    ]),
  );
}

export default function CatalogEditor({
  token,
  preferences,
  isEditable,
}: {
  token: string;
  preferences: Preferences;
  isEditable: boolean;
}) {
  const [selection, setSelection] = useState<Selection>(() =>
    toSelection(preferences),
  );
  const [note, setNote] = useState(preferences.note);
  const [status, setStatus] = useState<
    "idle" | "saving" | "saved" | "retrying" | "error"
  >("idle");
  const [error, setError] = useState("");
  const latest = useRef({ selection, note });
  const dirty = useRef(false);
  const saving = useRef(false);
  const queued = useRef(false);
  const attempt = useRef(0);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(async () => {
    if (retryTimer.current) {
      clearTimeout(retryTimer.current);
      retryTimer.current = null;
    }
    if (saving.current) {
      queued.current = true;
      return;
    }
    saving.current = true;
    setStatus("saving");
    try {
      do {
        queued.current = false;
        const { selection, note } = latest.current;
        const result = await savePreferences(token, {
          choices: Object.entries(selection).map(([categoryId, entry]) => ({
            categoryId,
            ...entry,
          })),
          note,
        });
        if (result.error) {
          attempt.current = 0;
          setError(result.error);
          setStatus("error");
          return;
        }
      } while (queued.current);
      attempt.current = 0;
      if (!noteTimer.current) dirty.current = false;
      setStatus("saved");
    } catch {
      if (attempt.current < RETRY_DELAYS.length) {
        const delay = RETRY_DELAYS[attempt.current++];
        setStatus("retrying");
        retryTimer.current = setTimeout(() => {
          retryTimer.current = null;
          save();
        }, delay);
      } else {
        attempt.current = 0;
        setError("Speichern fehlgeschlagen. Bitte prüfe deine Verbindung.");
        setStatus("error");
      }
    } finally {
      saving.current = false;
    }
  }, [token]);

  const flushNote = useCallback(() => {
    if (!noteTimer.current) return;
    clearTimeout(noteTimer.current);
    noteTimer.current = null;
    save();
  }, [save]);

  useEffect(() => {
    function warnIfUnsaved(e: BeforeUnloadEvent) {
      if (dirty.current) e.preventDefault();
    }
    window.addEventListener("beforeunload", warnIfUnsaved);
    return () => {
      window.removeEventListener("beforeunload", warnIfUnsaved);
      if (noteTimer.current || retryTimer.current) {
        if (noteTimer.current) clearTimeout(noteTimer.current);
        noteTimer.current = null;
        save();
      }
    };
  }, [save]);

  function updateSelection(next: Selection) {
    latest.current.selection = next;
    dirty.current = true;
    setSelection(next);
    save();
  }

  function setSentiment(categoryId: string, sentiment: Sentiment) {
    const next = { ...latest.current.selection };
    if (next[categoryId]?.sentiment === sentiment) {
      delete next[categoryId];
    } else {
      next[categoryId] = { sentiment, tags: [] };
    }
    updateSelection(next);
  }

  function toggleTag(categoryId: string, tagId: string) {
    const entry = latest.current.selection[categoryId];
    if (!entry || entry.sentiment !== "like") return;
    const tags = entry.tags.includes(tagId)
      ? entry.tags.filter((tag) => tag !== tagId)
      : [...entry.tags, tagId];
    updateSelection({
      ...latest.current.selection,
      [categoryId]: { ...entry, tags },
    });
  }

  function handleNoteChange(value: string) {
    latest.current.note = value;
    dirty.current = true;
    setNote(value);
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => {
      noteTimer.current = null;
      save();
    }, 800);
  }

  return (
    <section className="bg-white/10 backdrop-blur rounded-xl p-6 flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold text-white">Mein Wunschkatalog</h2>
        <p className="text-white/50 text-sm mt-1">
          Kreuze an, worüber du dich freust und was du lieber nicht möchtest.
          Bei „Gern“ kannst du es noch genauer eingrenzen.
        </p>
      </div>

      <ul className="flex flex-col gap-2">
        {CATALOG.map((category) => {
          const entry = selection[category.id];
          return (
            <li
              key={category.id}
              className={`rounded-lg px-4 py-3 flex flex-col gap-3 transition ${
                entry?.sentiment === "like"
                  ? "bg-green-500/15 border border-green-500/40"
                  : entry?.sentiment === "dislike"
                    ? "bg-red-500/10 border border-red-500/30"
                    : "bg-white/5 border border-transparent"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-3 text-white min-w-0">
                  <CategoryIcon
                    categoryId={category.id}
                    className="w-5 h-5 shrink-0 text-white/70"
                  />
                  {category.label}
                </span>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSentiment(category.id, "like")}
                    disabled={!isEditable}
                    aria-pressed={entry?.sentiment === "like"}
                    className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition disabled:cursor-not-allowed ${
                      entry?.sentiment === "like"
                        ? "bg-green-600 text-white"
                        : "bg-white/10 text-white/60 hover:text-white"
                    }`}
                  >
                    <Heart className="w-4 h-4" aria-hidden />
                    Gern
                  </button>
                  <button
                    type="button"
                    onClick={() => setSentiment(category.id, "dislike")}
                    disabled={!isEditable}
                    aria-pressed={entry?.sentiment === "dislike"}
                    className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition disabled:cursor-not-allowed ${
                      entry?.sentiment === "dislike"
                        ? "bg-red-600 text-white"
                        : "bg-white/10 text-white/60 hover:text-white"
                    }`}
                  >
                    <Ban className="w-4 h-4" aria-hidden />
                    Nein
                  </button>
                </div>
              </div>

              {entry?.sentiment === "like" && (
                <div className="flex flex-wrap gap-2">
                  {category.tags.map((tag) => {
                    const active = entry.tags.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(category.id, tag.id)}
                        disabled={!isEditable}
                        aria-pressed={active}
                        className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm transition disabled:cursor-not-allowed ${
                          active
                            ? "bg-white text-purple-900"
                            : "bg-white/10 text-white/70 hover:text-white"
                        }`}
                      >
                        {active && <Check className="w-3.5 h-3.5" aria-hidden />}
                        {tag.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <label className="flex flex-col gap-2 text-white/70 text-sm">
        Notiz (optional)
        <textarea
          value={note}
          onChange={(e) => handleNoteChange(e.target.value)}
          onBlur={flushNote}
          disabled={!isEditable}
          maxLength={NOTE_MAX_LENGTH}
          rows={3}
          placeholder="z. B. Kleidergröße M, keine Nüsse, lese gern Krimis"
          className="rounded-lg px-4 py-3 bg-white/10 text-white border border-white/20 focus:border-white/50 outline-none resize-none"
        />
      </label>

      <p
        aria-live="polite"
        className={`min-h-5 flex flex-wrap items-center justify-center gap-1.5 text-sm text-center ${
          status === "error" ? "text-orange-400" : "text-white/50"
        }`}
      >
        {status === "saving" && (
          <>
            <LoaderCircle className="w-4 h-4 animate-spin" aria-hidden />
            Speichert…
          </>
        )}
        {status === "saved" && (
          <>
            <Check className="w-4 h-4 text-green-400" aria-hidden />
            Gespeichert
          </>
        )}
        {status === "retrying" && (
          <>
            <LoaderCircle className="w-4 h-4 animate-spin" aria-hidden />
            Speichern fehlgeschlagen, neuer Versuch…
          </>
        )}
        {status === "error" && (
          <>
            <CircleAlert className="w-4 h-4 shrink-0" aria-hidden />
            {error}
            <button
              type="button"
              onClick={save}
              className="ml-1 underline hover:text-orange-300 transition"
            >
              Erneut versuchen
            </button>
          </>
        )}
      </p>
    </section>
  );
}
