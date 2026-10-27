import { ExternalLink, Lock } from "lucide-react";
import type { Wish } from "@/app/actions/wishes";
import GiftWrap from "@components/GiftWrap";
import ImagePreview from "@components/ImagePreview";

export default function WishCard({
  wish,
  index,
  actions,
  footer,
  taken = false,
  highlighted = false,
}: {
  wish: Wish;
  index: number;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  taken?: boolean;
  highlighted?: boolean;
}) {
  return (
    <article
      className={`flex flex-col overflow-hidden rounded-3xl bg-white/6 ring-1 transition ${
        highlighted
          ? "ring-2 ring-pine shadow-[0_0_24px_rgb(34_160_107/0.35)]"
          : "ring-white/12"
      }`}
    >
      {wish.imageUrl ? (
        <>
          <div
            className={`relative aspect-[16/9] ${taken ? "grayscale-[70%]" : ""}`}
          >
            <ImagePreview
              src={wish.imageUrl}
              alt={wish.title}
              className="absolute inset-0 h-full w-full"
            />
            {taken && (
              <span className="absolute inset-0 grid place-items-center bg-night/45">
                <span className="flex -rotate-12 items-center gap-1.5 rounded-lg border-2 border-cream/80 px-3 py-1 text-sm font-extrabold uppercase tracking-wider text-cream">
                  <Lock className="h-4 w-4" aria-hidden />
                  Reserviert
                </span>
              </span>
            )}
            {actions && (
              <div className="absolute right-2 top-2 flex gap-1.5">
                {actions}
              </div>
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1 p-3.5">
            <WishText wish={wish} />
            {footer && <div className="mt-auto pt-2">{footer}</div>}
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-3 p-3">
          <div className="flex items-center gap-3">
            <GiftWrap
              index={index}
              small
              className={`h-14 w-14 shrink-0 rounded-2xl ${taken ? "grayscale-[70%]" : ""}`}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <WishText wish={wish} />
              {taken && (
                <span className="flex items-center gap-1 text-[13px] font-semibold text-cream/50">
                  <Lock className="h-3.5 w-3.5" aria-hidden />
                  Reserviert
                </span>
              )}
            </div>
            {actions && <div className="flex shrink-0 gap-1.5">{actions}</div>}
          </div>
          {footer}
        </div>
      )}
    </article>
  );
}

function WishText({ wish }: { wish: Wish }) {
  return (
    <>
      <h3 className="line-clamp-2 break-words text-base font-bold leading-tight">
        {wish.title}
      </h3>
      {wish.url && (
        <a
          href={wish.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-w-0 items-center gap-1 text-[13px] text-gold-soft/80 transition-colors hover:text-gold-soft"
        >
          <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="truncate">{new URL(wish.url).hostname}</span>
        </a>
      )}
    </>
  );
}
