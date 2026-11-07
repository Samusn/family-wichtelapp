const COLORS = [
  "bg-berry shadow-[0_0_10px_3px_rgb(224_49_63/0.7)]",
  "bg-gold shadow-[0_0_10px_3px_rgb(248_201_74/0.7)]",
  "bg-pine shadow-[0_0_10px_3px_rgb(34_160_107/0.7)]",
  "bg-cream shadow-[0_0_10px_3px_rgb(255_248_236/0.6)]",
];

export default function Lights({
  count = 12,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  const segment = 100 / count;
  const wire = Array.from({ length: count }, (_, i) => {
    const start = i * segment;
    return `M${start} 1 Q${start + segment / 2} 9 ${start + segment} 1`;
  }).join(" ");

  return (
    <div
      className={`pointer-events-none h-6 ${className}`}
      aria-hidden
    >
      <svg
        viewBox="0 0 100 10"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <path
          d={wire}
          fill="none"
          stroke="rgb(20 10 7 / 0.9)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="absolute top-[11px] flex -translate-x-1/2 flex-col items-center"
          style={{ left: `${(i + 0.5) * segment}%` }}
        >
          <span className="h-1.5 w-1.5 rounded-[1px] bg-night" />
          <span
            className={`twinkle h-3.5 w-2.5 rounded-full ${COLORS[i % COLORS.length]}`}
            style={{ animationDelay: `${(i * 0.37) % 2}s` }}
          />
        </span>
      ))}
    </div>
  );
}
