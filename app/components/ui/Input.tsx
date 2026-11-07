const fieldClass =
  "w-full rounded-2xl bg-white/8 px-4 py-3.5 text-cream placeholder:text-cream/35 border border-white/12 outline-none transition-all duration-200 focus:bg-white/12 focus:border-gold/50 focus:shadow-[0_0_0_3px_rgb(248_201_74/0.12)] disabled:opacity-50";

export default function Input({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${fieldClass} ${className}`} {...props} />;
}

export function Textarea({
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={`${fieldClass} resize-none ${className}`} {...props} />
  );
}
