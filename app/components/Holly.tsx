const LEAF =
  "M0 0 Q4 -6 8 -3 Q11 -8 15 -4 Q18 -9 22 -4 Q25 -8 28 -3 Q32 -6 36 0 Q32 6 28 3 Q25 8 22 4 Q18 9 15 4 Q11 8 8 3 Q4 6 0 0Z";

export default function Holly({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 72 44"
      className={`pointer-events-none drop-shadow-[0_4px_6px_rgb(0_0_0/0.4)] ${className}`}
      aria-hidden
    >
      <g transform="translate(36 22) rotate(200)">
        <path d={LEAF} fill="#116343" />
        <path d="M2 0 L34 0" stroke="#22a06b" strokeWidth="1" />
      </g>
      <g transform="translate(36 22) rotate(-20)">
        <path d={LEAF} fill="#22a06b" />
        <path d="M2 0 L34 0" stroke="#116343" strokeWidth="1" />
      </g>
      <circle cx="31" cy="19" r="5" fill="#9e1626" />
      <circle cx="41" cy="18" r="5" fill="#e0313f" />
      <circle cx="36" cy="26" r="5" fill="#e0313f" />
      <circle cx="39.5" cy="16.5" r="1.4" fill="#fff8ec" opacity="0.8" />
      <circle cx="34.5" cy="24.5" r="1.4" fill="#fff8ec" opacity="0.8" />
    </svg>
  );
}
