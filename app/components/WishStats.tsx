import { Gift } from "lucide-react";

export default function WishStats({
  count,
  compact = false,
}: {
  count: number;
  compact?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 self-end rounded-full bg-gold/15 font-semibold text-gold-soft ring-1 ring-gold/40 ${
        compact ? "px-2 py-0.5 text-[12px]" : "px-3 py-1 text-[13px]"
      }`}
    >
      <Gift className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden />
      {count} {count === 1 ? "Wunsch" : "Wünsche"}
    </span>
  );
}
