"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Ban,
  Check,
  ChevronDown,
  CircleAlert,
  UtensilsCrossed,
  Dices,
  Dumbbell,
  Gamepad2,
  Heart,
  Lamp,
  LoaderCircle,
  Music,
  Shirt,
  StickyNote,
  Ticket,
  type LucideIcon,
} from "lucide-react";
import {
  savePreferences,
  type Preferences,
  type Sentiment,
} from "@/app/actions/catalog";
import { GROUPS, NOTE_MAX_LENGTH, getCategory } from "@/lib/catalog";
import CategoryIcon from "@/app/components/CategoryIcon";
import Card from "@components/ui/Card";
import { Textarea } from "@components/ui/Input";
import { useSetLikes } from "./LiveWishCount";

type Selection = Record<string, { sentiment: Sentiment; tags: string[] }>;

const GROUP_ICONS: Record<string, LucideIcon> = {
  food: UtensilsCrossed,
  style: Shirt,
  tech: Gamepad2,
  culture: Music,
  leisure: Dices,
  home: Lamp,
  active: Dumbbell,
  experiences: Ticket,
};

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
  const [notes, setNotes] = useState(preferences.notes);
  const setLikes = useSetLikes();
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [status, setStatus] = useState<
    "idle" | "saving" | "saved" | "retrying" | "error"
  >("idle");
  const [error, setError] = useState("");
  const latest = useRef({ selection, notes });
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
        const { selection, notes } = latest.current;
        const result = await savePreferences(token, {
          choices: Object.entries(selection).map(([categoryId, entry]) => ({
            categoryId,
            ...entry,
          })),
          notes,
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
    setLikes(
      Object.values(next).filter((entry) => entry.sentiment === "like").length,
    );
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

  function handleNoteChange(groupId: string, value: string) {
    const next = { ...latest.current.notes, [groupId]: value };
    latest.current.notes = next;
    dirty.current = true;
    setNotes(next);
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => {
      noteTimer.current = null;
      save();
    }, 800);
  }

  function toggleGroup(groupId: string) {
    setOpenGroups((current) =>
      current.includes(groupId)
        ? current.filter((id) => id !== groupId)
        : [...current, groupId],
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-center gap-4 text-sm text-cream/70">
        <span className="flex items-center gap-1.5">
          <Heart className="w-4 h-4 text-pine fill-current" aria-hidden />
          Gern
        </span>
        <span className="flex items-center gap-1.5">
          <Ban className="w-4 h-4 text-berry" aria-hidden />
          Bitte nicht
        </span>
      </div>

      {GROUPS.map((group) => {
        const isOpen = openGroups.includes(group.id);
        const groupEntries = group.categoryIds
          .map((categoryId) => selection[categoryId])
          .filter(Boolean);
        const groupLikes = groupEntries.filter(
          (entry) => entry.sentiment === "like",
        ).length;
        const groupDislikes = groupEntries.length - groupLikes;
        const hasNote = Boolean(notes[group.id]?.trim());

        return (
          <Card key={group.id} className="flex flex-col p-0">
            <button
              type="button"
              onClick={() => toggleGroup(group.id)}
              aria-expanded={isOpen}
              aria-controls={`group-${group.id}`}
              className="flex min-h-14 w-full items-center gap-3 px-5 py-3 text-left"
            >
              {(() => {
                const Icon = GROUP_ICONS[group.id];
                return Icon ? (
                  <span className="grid place-items-center w-9 h-9 shrink-0 rounded-xl bg-gradient-to-b from-gold-soft/20 to-gold/10 text-gold">
                    <Icon className="w-[18px] h-[18px]" strokeWidth={2} aria-hidden />
                  </span>
                ) : null;
              })()}
              <span className="flex-1 font-extrabold text-cream">
                {group.label}
              </span>
              <span className="flex items-center gap-2 text-sm font-semibold">
                {groupLikes > 0 && (
                  <span className="flex items-center gap-1 text-pine">
                    <Heart className="w-4 h-4 fill-current" aria-hidden />
                    {groupLikes}
                  </span>
                )}
                {groupDislikes > 0 && (
                  <span className="flex items-center gap-1 text-red-300">
                    <Ban className="w-4 h-4" aria-hidden />
                    {groupDislikes}
                  </span>
                )}
                {hasNote && (
                  <StickyNote
                    className="w-4 h-4 text-gold-soft"
                    aria-label="Notiz vorhanden"
                  />
                )}
              </span>
              <ChevronDown
                className={`w-5 h-5 shrink-0 text-cream/60 transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
                aria-hidden
              />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`group-${group.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-3 px-4 pb-4">
                    <ul className="flex flex-col gap-2">
                      {group.categoryIds.map((categoryId) => {
                        const category = getCategory(categoryId)!;
                        const entry = selection[category.id];
                        return (
                          <li
                            key={category.id}
                            className={`flex flex-col gap-3 rounded-2xl p-3 ring-1 transition ${
                              entry?.sentiment === "like"
                                ? "bg-pine/20 ring-pine/60"
                                : entry?.sentiment === "dislike"
                                  ? "bg-berry/15 ring-berry/40"
                                  : "bg-white/5 ring-white/10"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={`/images/catalog/${category.id}.jpg`}
                                alt=""
                                className={`w-10 h-10 shrink-0 rounded-xl object-cover transition ${
                                  entry?.sentiment === "dislike"
                                    ? "opacity-40 grayscale"
                                    : ""
                                }`}
                              />
                              <span
                                className={`flex-1 min-w-0 font-bold leading-tight ${
                                  entry?.sentiment === "dislike"
                                    ? "text-cream/60 line-through decoration-berry/70"
                                    : "text-cream"
                                }`}
                              >
                                {category.label}
                              </span>
                              <div className="flex shrink-0 gap-1.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSentiment(category.id, "like")
                                  }
                                  disabled={!isEditable}
                                  aria-pressed={entry?.sentiment === "like"}
                                  aria-label={`${category.label}: Gern`}
                                  className={`grid place-items-center w-11 h-11 rounded-xl transition active:scale-90 disabled:cursor-not-allowed ${
                                    entry?.sentiment === "like"
                                      ? "bg-pine text-cream shadow-[0_0_14px_rgb(34_160_107/0.6)]"
                                      : "bg-white/10 text-cream/50 hover:text-cream hover:bg-white/15"
                                  }`}
                                >
                                  <Heart
                                    className={`w-5 h-5 ${entry?.sentiment === "like" ? "fill-current" : ""}`}
                                    aria-hidden
                                  />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSentiment(category.id, "dislike")
                                  }
                                  disabled={!isEditable}
                                  aria-pressed={entry?.sentiment === "dislike"}
                                  aria-label={`${category.label}: Bitte nicht`}
                                  className={`grid place-items-center w-11 h-11 rounded-xl transition active:scale-90 disabled:cursor-not-allowed ${
                                    entry?.sentiment === "dislike"
                                      ? "bg-berry text-cream shadow-[0_0_14px_rgb(224_49_63/0.6)]"
                                      : "bg-white/10 text-cream/50 hover:text-cream hover:bg-white/15"
                                  }`}
                                >
                                  <Ban className="w-5 h-5" aria-hidden />
                                </button>
                              </div>
                            </div>

                            {entry?.sentiment === "like" && (
                              <div className="flex flex-wrap gap-2 pl-[52px]">
                                {category.tags.map((tag) => {
                                  const active = entry.tags.includes(tag.id);
                                  return (
                                    <button
                                      key={tag.id}
                                      type="button"
                                      onClick={() =>
                                        toggleTag(category.id, tag.id)
                                      }
                                      disabled={!isEditable}
                                      aria-pressed={active}
                                      className={`flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold transition active:scale-95 disabled:cursor-not-allowed ${
                                        active
                                          ? "bg-gold text-night shadow-[0_0_12px_rgb(248_201_74/0.5)]"
                                          : "bg-white/10 text-cream/80 ring-1 ring-white/15 hover:bg-white/20"
                                      }`}
                                    >
                                      {active && (
                                        <Check
                                          className="w-3.5 h-3.5"
                                          aria-hidden
                                        />
                                      )}
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
                    <Textarea
                      value={notes[group.id] ?? ""}
                      onChange={(e) =>
                        handleNoteChange(group.id, e.target.value)
                      }
                      onBlur={flushNote}
                      disabled={!isEditable}
                      maxLength={NOTE_MAX_LENGTH}
                      rows={2}
                      aria-label={`Notiz zu ${group.label}`}
                      placeholder={`Notiz zu ${group.label} (optional)`}
                      className="text-sm"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        );
      })}

      <p
        aria-live="polite"
        className={`sticky bottom-[calc(1rem+var(--nav-height,0rem)+env(safe-area-inset-bottom))] mx-auto flex flex-wrap items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm text-center backdrop-blur-xl transition-opacity ${
          status === "idle" ? "opacity-0" : "opacity-100"
        } ${
          status === "error"
            ? "bg-night/90 text-orange-300 ring-1 ring-orange-300/40"
            : "bg-night/80 text-cream/80 ring-1 ring-white/15"
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
            <Check className="w-4 h-4 text-pine" aria-hidden />
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
              className="ml-1 font-bold underline hover:text-orange-200 transition"
            >
              Erneut versuchen
            </button>
          </>
        )}
      </p>
    </div>
  );
}
