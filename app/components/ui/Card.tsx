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
      className={`glass relative rounded-[20px] p-5 ${className}`}
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
      className={`flex items-center gap-3 text-lg font-bold text-gold ${className}`}
    >
      {icon && (
        <span className="grid place-items-center w-9 h-9 shrink-0 rounded-xl bg-gradient-to-b from-gold-soft/20 to-gold/10 text-gold [&>svg]:h-[18px] [&>svg]:w-[18px] [&>svg]:stroke-[2]">
          {icon}
        </span>
      )}
      {children}
    </h2>
  );
}
