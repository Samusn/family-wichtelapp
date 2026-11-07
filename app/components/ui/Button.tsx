const VARIANTS = {
  primary:
    "bg-gradient-to-b from-berry to-berry-deep text-cream shadow-lg shadow-berry-deep/30 hover:shadow-xl hover:shadow-berry-deep/40",
  festive:
    "bg-gradient-to-b from-berry to-berry-deep text-gold-soft animate-glow",
  pine: "bg-gradient-to-b from-pine to-pine-deep text-cream shadow-lg shadow-pine-deep/30 hover:shadow-xl hover:shadow-pine-deep/40",
  ghost: "text-cream/60 hover:text-cream hover:bg-white/8",
  danger: "bg-berry/10 text-red-300 hover:bg-berry/20",
} as const;

const SIZES = {
  sm: "min-h-11 min-w-11 px-3 py-1.5 text-sm rounded-full gap-1.5",
  md: "px-6 py-3.5 rounded-full gap-2",
  lg: "px-8 py-4 text-lg rounded-full gap-2.5",
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
      className={`inline-flex items-center justify-center font-bold transition-all duration-200 active:scale-[0.97] active:opacity-80 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  );
}
