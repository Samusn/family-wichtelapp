"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  addWish,
  deleteWish,
  updateWish,
  type Wish,
} from "@/app/actions/wishes";
import WishContent from "@components/WishContent";
import Button from "@components/ui/Button";
import Card from "@components/ui/Card";
import Input from "@components/ui/Input";
import { resizeImage } from "./resizeImage";

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
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Wish | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      {wishes.length === 0 && !formOpen && (
        <p className="text-center text-cream/60">Noch keine Wünsche.</p>
      )}

      {wishes.length > 0 && (
        <ul className="flex flex-col gap-2">
          {wishes.map((wish) => (
            <li
              key={wish.id}
              className="flex items-center gap-2 rounded-2xl bg-white/5 p-2 ring-1 ring-white/10"
            >
              <WishContent wish={wish} />
              {isEditable && (
                <div className="flex shrink-0 flex-col">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditing(wish)}
                    disabled={loading}
                    aria-label={`${wish.title} bearbeiten`}
                  >
                    <Pencil className="w-4 h-4" aria-hidden />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(wish)}
                    disabled={loading}
                    aria-label={`${wish.title} löschen`}
                    className="text-red-300 hover:text-red-200"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden />
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {isEditable && !formOpen && (
        <Button variant="pine" onClick={() => setFormOpen(true)}>
          <Plus className="w-5 h-5" aria-hidden />
          Wunsch hinzufügen
        </Button>
      )}

      {isEditable && formOpen && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10"
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
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/20 transition hover:bg-white/15">
            <ImagePlus
              className="w-5 h-5 shrink-0 text-gold-soft"
              aria-hidden
            />
            <span className="truncate text-cream/80">
              {image ? image.name : "Bild hinzufügen (optional)"}
            </span>
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              className="sr-only"
            />
          </label>
          {editing?.imageUrl && !image && (
            <label className="flex items-center gap-2 text-sm text-cream/70">
              <input
                type="checkbox"
                checked={removeImage}
                onChange={(e) => setRemoveImage(e.target.checked)}
                className="accent-berry"
              />
              Aktuelles Bild entfernen
            </label>
          )}
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
