import Holly from "@components/Holly";

export default function Card({
  className = "",
  as: Tag = "section",
  holly = false,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  as?: "section" | "form";
  holly?: boolean;
}) {
  return (
    <Tag
      className={`glass relative rounded-3xl p-6 ${className}`}
      {...props}
    >
      {holly && <Holly className="absolute -top-5 -right-2 w-20 rotate-12" />}
      {children}
    </Tag>
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
        <span className="relative mt-2 grid place-items-center w-10 h-10 shrink-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--color-gold-soft),var(--color-gold)_45%,var(--color-gold-deep))] text-berry-deep shadow-[0_0_16px_rgb(248_201_74/0.4)] [&>svg]:h-[18px] [&>svg]:w-[18px] [&>svg]:stroke-[2.25]">
          <span
            className="absolute -top-2 left-1/2 h-2 w-3.5 -translate-x-1/2 rounded-t-sm bg-gradient-to-b from-gold-soft to-gold-deep ring-1 ring-night/30"
            aria-hidden
          />
          <span
            className="absolute -top-3.5 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full ring-[1.5px] ring-gold-soft"
            aria-hidden
          />
          {icon}
        </span>
      )}
      {children}
    </h2>
  );
}
