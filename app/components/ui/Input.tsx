const fieldClass =
  "w-full rounded-2xl bg-white/10 px-4 py-3 text-cream placeholder:text-cream/40 ring-1 ring-white/20 outline-none transition focus:bg-white/15 focus:ring-2 focus:ring-gold disabled:opacity-60";

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
