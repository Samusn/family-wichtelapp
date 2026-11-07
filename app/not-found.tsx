import Link from "next/link";
import { Home } from "lucide-react";
import Animation from "@components/ui/Animation";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <span className="font-display text-[10rem] font-bold leading-none text-gold-soft/25">
        404
      </span>

      <Animation name="cats-christmas" className="-mt-10 w-80 h-80 sm:w-96 sm:h-96" />

      <p className="-mt-4 text-cream/70 text-[15px]">
        Hier gibt's nichts zu sehen.
      </p>

      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-pine to-pine-deep px-8 py-3.5 font-bold text-cream shadow-lg shadow-pine-deep/30 transition-all hover:shadow-xl active:scale-[0.97]"
      >
        <Home className="w-5 h-5" aria-hidden />
        Zurück zur Startseite
      </Link>
    </main>
  );
}
