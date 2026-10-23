const FLAKE_COUNT = 60;

function seeded(index: number, salt: number) {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const flakes = Array.from({ length: FLAKE_COUNT }, (_, i) => {
  const x = seeded(i, 1) * 100;
  const drift = (seeded(i, 2) - 0.5) * 20;
  return {
    "--snow-x": `${x}vw`,
    "--snow-x-end": `${x + drift}vw`,
    "--snow-scale": (0.3 + seeded(i, 3) * 0.7).toFixed(2),
    "--snow-duration": `${12 + seeded(i, 4) * 18}s`,
    "--snow-delay": `${-seeded(i, 5) * 30}s`,
    opacity: (0.3 + seeded(i, 6) * 0.6).toFixed(2),
  } as React.CSSProperties;
});

export default function Snowfall() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {flakes.map((style, i) => (
        <span key={i} className="snowflake" style={style} />
      ))}
    </div>
  );
}
