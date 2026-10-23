import { ExternalLink, Gift } from "lucide-react";
import type { Wish } from "@/app/actions/wishes";

export default function WishContent({ wish }: { wish: Wish }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      {wish.imageUrl ? (
        <img
          src={wish.imageUrl}
          alt=""
          className="w-16 h-16 shrink-0 rounded-xl object-cover ring-1 ring-white/20"
        />
      ) : (
        <span className="grid place-items-center w-16 h-16 shrink-0 rounded-xl bg-white/10 text-gold-soft">
          <Gift className="w-6 h-6" aria-hidden />
        </span>
      )}
      <div className="flex min-w-0 flex-col gap-1">
        <span className="font-bold leading-tight break-words">
          {wish.title}
        </span>
        {wish.url && (
          <a
            href={wish.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-gold-soft underline-offset-2 hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden />
            <span className="truncate">{new URL(wish.url).hostname}</span>
          </a>
        )}
      </div>
    </div>
  );
}
