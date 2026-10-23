import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function BackLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="-ml-2 flex min-h-11 items-center gap-1 self-start rounded-xl px-2 text-sm font-semibold text-cream/70 transition hover:text-cream"
    >
      <ChevronLeft className="w-4 h-4" aria-hidden />
      Zurück
    </Link>
  );
}
