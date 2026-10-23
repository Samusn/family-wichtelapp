import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function BackLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="-ml-1 flex min-h-11 items-center gap-0.5 self-start rounded-full px-3 text-[15px] font-semibold text-gold transition-colors hover:text-gold-soft active:opacity-70"
    >
      <ChevronLeft className="w-5 h-5" aria-hidden />
      Zurück
    </Link>
  );
}
