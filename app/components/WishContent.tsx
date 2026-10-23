import { ExternalLink, Gift } from "lucide-react";
import type { Wish } from "@/app/actions/wishes";

export default function WishContent({ wish }: { wish: Wish }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3.5">
      {wish.imageUrl ? (
        <img
          src={wish.imageUrl}
          alt=""
          className="w-14 h-14 shrink-0 rounded-2xl object-cover border border-white/12"
        />
      ) : (
        <span className="grid place-items-center w-14 h-14 shrink-0 rounded-2xl bg-white/8 text-gold-soft">
          <Gift className="w-6 h-6" aria-hidden />
        </span>
      )}
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="font-bold text-[15px] leading-tight break-words">
          {wish.title}
        </span>
        {wish.url && (
          <a
            href={wish.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[13px] text-gold-soft/80 hover:text-gold-soft transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden />
            <span className="truncate">{new URL(wish.url).hostname}</span>
          </a>
        )}
      </div>
    </div>
  );
}
