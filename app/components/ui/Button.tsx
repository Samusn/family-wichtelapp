const VARIANTS = {
  primary:
    "bg-gradient-to-b from-berry to-berry-deep text-cream ring-2 ring-gold shadow-[0_0_24px_rgb(248_201_74/0.35)] hover:shadow-[0_0_32px_rgb(248_201_74/0.55)]",
  festive:
    "bg-gradient-to-b from-berry to-berry-deep text-gold-soft animate-glow",
  pine: "bg-gradient-to-b from-pine to-pine-deep text-cream ring-1 ring-white/20 shadow-lg shadow-pine-deep/40",
  ghost: "text-cream/60 hover:text-cream hover:bg-white/10",
  danger: "bg-berry/15 text-red-300 ring-1 ring-berry/40 hover:bg-berry/30",
} as const;

const SIZES = {
  sm: "px-3 py-1.5 text-sm rounded-xl gap-1.5",
  md: "px-5 py-3 rounded-2xl gap-2",
  lg: "px-7 py-4 text-lg rounded-2xl gap-2.5",
} as const;

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center font-bold transition duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  );
}
