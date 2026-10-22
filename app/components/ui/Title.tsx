export default function Title({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h1
      className={`font-display font-bold text-shimmer text-5xl leading-tight text-balance ${className}`}
    >
      {children}
    </h1>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur px-3 py-1 text-sm font-semibold text-gold-soft">
      {children}
    </p>
  );
}
