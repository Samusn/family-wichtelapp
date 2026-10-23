"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookmarkCheck, Check, Lock } from "lucide-react";
import {
  reserveWish,
  unreserveWish,
  type Reservation,
} from "@/app/actions/wishes";
import Button from "@components/ui/Button";

export default function ReserveButton({
  token,
  wishId,
  reservation,
  isEditable,
}: {
  token: string;
  wishId: string;
  reservation: Reservation;
  isEditable: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run(action: () => Promise<{ error: string | null }>) {
    setLoading(true);
    setError("");
    try {
      const result = await action();
      if (result.error) setError(result.error);
    } catch {
      setError("Fehlgeschlagen. Bitte nochmal versuchen.");
    }
    router.refresh();
    setLoading(false);
  }

  if (reservation === "taken") {
    return (
      <span className="flex items-center gap-1.5 text-sm font-semibold text-cream/50">
        <Lock className="w-4 h-4" aria-hidden />
        Reserviert
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {reservation === "mine" ? (
        <>
          <span className="flex items-center gap-1.5 text-sm font-bold text-pine">
            <Check className="w-4 h-4" aria-hidden />
            Von dir reserviert
          </span>
          {isEditable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => run(() => unreserveWish(token, wishId))}
              disabled={loading}
            >
              Freigeben
            </Button>
          )}
        </>
      ) : (
        isEditable && (
          <Button
            variant="pine"
            size="sm"
            onClick={() => run(() => reserveWish(token, wishId))}
            disabled={loading}
          >
            <BookmarkCheck className="w-4 h-4" aria-hidden />
            Reservieren
          </Button>
        )
      )}
      {error && <span className="text-xs text-orange-300">{error}</span>}
    </div>
  );
}
