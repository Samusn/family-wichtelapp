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
