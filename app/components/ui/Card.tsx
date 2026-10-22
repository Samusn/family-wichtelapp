export default function Card({
  className = "",
  as: Tag = "section",
  ...props
}: React.HTMLAttributes<HTMLElement> & { as?: "section" | "form" }) {
  return (
    <Tag
      className={`rounded-3xl bg-white/[0.08] ring-1 ring-white/15 backdrop-blur-xl shadow-[0_12px_40px_rgb(0_0_0/0.35)] p-6 ${className}`}
      {...props}
    />
  );
}

export function CardTitle({
  icon,
  children,
  className = "",
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`flex items-center gap-3 text-xl font-extrabold text-cream ${className}`}
    >
      {icon && (
        <span className="grid place-items-center w-10 h-10 shrink-0 rounded-2xl bg-gradient-to-br from-gold to-gold-deep text-night shadow-[0_0_16px_rgb(248_201_74/0.4)]">
          {icon}
        </span>
      )}
      {children}
    </h2>
  );
}
