"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  addWish,
  deleteWish,
  updateWish,
  type Wish,
} from "@/app/actions/wishes";
import WishCard from "@components/WishCard";
import Button from "@components/ui/Button";
import Card from "@components/ui/Card";
import Input from "@components/ui/Input";
import { resizeImage } from "./resizeImage";

const ICON_BUTTON =
  "grid h-11 w-11 place-items-center rounded-full bg-night/60 text-cream ring-1 ring-white/20 backdrop-blur-md transition hover:bg-night/80 active:scale-95 disabled:opacity-40";

export default function WishEditor({
  token,
  wishes,
  isEditable,
}: {
  token: string;
  wishes: Wish[];
  isEditable: boolean;
}) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Wish | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!image) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(image);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  const shownImage =
    preview ?? (editing?.imageUrl && !removeImage ? editing.imageUrl : null);

  function clearImage() {
    if (image) {
      setImage(null);
      if (fileInput.current) fileInput.current.value = "";
    } else {
      setRemoveImage(true);
    }
  }

  useEffect(() => {
    if (editing)
      form.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [editing]);

  function resetForm() {
    setFormOpen(false);
    setEditing(null);
    setTitle("");
    setUrl("");
    setImage(null);
    setRemoveImage(false);
    setError("");
    if (fileInput.current) fileInput.current.value = "";
  }

  function startEditing(wish: Wish) {
    resetForm();
    setFormOpen(true);
    setEditing(wish);
    setTitle(wish.title);
    setUrl(wish.url ?? "");
  }

  async function run(action: () => Promise<{ error: string | null }>) {
    setLoading(true);
    setError("");
    try {
      const result = await action();
      if (result.error) {
        setError(result.error);
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setError("Speichern fehlgeschlagen. Bitte versuche es nochmal.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const success = await run(async () => {
      const formData = new FormData();
      formData.set("title", title);
      formData.set("url", url);
      if (image) formData.set("image", await resizeImage(image));
      if (removeImage) formData.set("removeImage", "true");
      return editing
        ? updateWish(token, editing.id, formData)
        : addWish(token, formData);
    });
    if (success) resetForm();
  }

  async function handleDelete(wish: Wish) {
    if (!confirm(`„${wish.title}“ wirklich löschen?`)) return;
    const success = await run(() => deleteWish(token, wish.id));
    if (success && editing?.id === wish.id) resetForm();
  }

  return (
    <Card holly className="flex flex-col gap-4">
      {wishes.length === 0 && !formOpen && !isEditable && (
        <p className="text-center text-cream/60">Noch keine Wünsche.</p>
      )}

      {(wishes.length > 0 || (isEditable && !formOpen)) && (
        <ul className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {wishes.map((wish, index) => (
              <motion.li
                key={wish.id}
                layout
                initial={{ opacity: 0, scale: 0.85, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
              >
                <WishCard
                  wish={wish}
                  index={index}
                  highlighted={editing?.id === wish.id}
                  actions={
                    isEditable && (
                      <>
                        <button
                          type="button"
                          onClick={() => startEditing(wish)}
                          disabled={loading}
                          aria-label={`${wish.title} bearbeiten`}
                          className={ICON_BUTTON}
                        >
                          <Pencil className="w-4 h-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(wish)}
                          disabled={loading}
                          aria-label={`${wish.title} löschen`}
                          className={`${ICON_BUTTON} text-red-200`}
                        >
                          <Trash2 className="w-4 h-4" aria-hidden />
                        </button>
                      </>
                    )
                  }
                />
              </motion.li>
            ))}
            {isEditable && !formOpen && (
              <motion.li key="add" layout>
                <button
                  type="button"
                  onClick={() => setFormOpen(true)}
                  className="group flex min-h-20 w-full items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-gold/40 bg-gold/5 p-4 text-gold-soft transition hover:border-gold/70 hover:bg-gold/10 active:scale-[0.98]"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-b from-pine to-pine-deep text-cream shadow-lg shadow-pine-deep/30 transition-transform group-hover:rotate-90">
                    <Plus className="w-6 h-6" aria-hidden />
                  </span>
                  <span className="text-sm font-bold">
                    {wishes.length === 0
                      ? "Ersten Wunsch hinzufügen"
                      : "Wunsch hinzufügen"}
                  </span>
                </button>
              </motion.li>
            )}
          </AnimatePresence>
        </ul>
      )}

      {isEditable && formOpen && (
        <form
          ref={form}
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 rounded-3xl bg-white/5 p-4 ring-1 ring-gold/30"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold">
              {editing ? "Wunsch bearbeiten" : "Neuer Wunsch"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetForm}
              aria-label="Abbrechen"
            >
              <X className="w-4 h-4" aria-hidden />
            </Button>
          </div>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Was wünschst du dir?"
            maxLength={255}
            autoFocus
          />
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Link (optional)"
          />
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 py-2 pl-2 pr-2 ring-1 ring-white/20 transition hover:bg-white/15">
            <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
              {shownImage ? (
                <img
                  src={shownImage}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <span className="grid h-12 w-12 shrink-0 place-items-center">
                  <ImagePlus className="w-5 h-5 text-gold-soft" aria-hidden />
                </span>
              )}
              <span className="truncate text-cream/80">
                {image
                  ? image.name
                  : shownImage
                    ? "Bild ändern"
                    : "Bild hinzufügen (optional)"}
              </span>
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => setImage(e.target.files?.[0] ?? null)}
                className="sr-only"
              />
            </label>
            {shownImage && (
              <button
                type="button"
                onClick={clearImage}
                aria-label="Bild entfernen"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-cream/70 transition hover:bg-white/10 hover:text-cream active:scale-95"
              >
                <X className="w-5 h-5" aria-hidden />
              </button>
            )}
          </div>
          {error && <p className="text-sm text-orange-300">{error}</p>}
          <Button type="submit" disabled={loading || !title.trim()}>
            {loading ? "Speichern…" : editing ? "Speichern" : "Hinzufügen"}
          </Button>
        </form>
      )}

      {!formOpen && error && <p className="text-sm text-orange-300">{error}</p>}
    </Card>
  );
}
