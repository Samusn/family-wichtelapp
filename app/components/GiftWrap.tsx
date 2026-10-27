import { Gift } from "lucide-react";

const WRAPS = [
  "from-berry to-berry-deep",
  "from-pine to-pine-deep",
  "from-gold to-gold-deep",
] as const;

export function wrapFor(index: number) {
  return WRAPS[index % WRAPS.length];
}

export default function GiftWrap({
  index,
  className = "",
  children,
}: {
  index: number;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${wrapFor(index)} ${className}`}
      aria-hidden
    >
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgb(255_255_255/0.18)_1.5px,transparent_2px)] bg-[length:14px_14px]" />
      <span className="absolute inset-y-0 left-1/2 w-3 -translate-x-1/2 bg-gradient-to-r from-gold-soft via-gold to-gold-soft shadow-[0_0_8px_rgb(0_0_0/0.25)]" />
      <span className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 bg-gradient-to-b from-gold-soft via-gold to-gold-soft shadow-[0_0_8px_rgb(0_0_0/0.25)]" />
      <span className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gold-soft text-gold-deep shadow-md ring-2 ring-gold">
        <Gift className="h-5 w-5" strokeWidth={2.25} />
      </span>
      {children}
    </div>
  );
}
