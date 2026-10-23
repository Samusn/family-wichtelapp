import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, Gift, ScrollText, Users } from "lucide-react";
import { getParticipantByToken } from "@/app/actions/participants";
import Animation from "@components/ui/Animation";
import Card from "@components/ui/Card";
import Page from "@components/ui/Page";
import Title from "@components/ui/Title";

export default async function StartPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const participant = await getParticipantByToken(token);

  if (!participant || !participant.session) {
    redirect("/");
  }

  const base = `/p/${token}`;
  const steps = [
    {
      href: `${base}/los`,
      icon: Gift,
      title: "Los öffnen",
      text: "Finde heraus, wen du dieses Jahr beschenkst. Behalte es für dich!",
    },
    {
      href: `${base}/wunschliste`,
      icon: ScrollText,
      title: "Wunschliste füllen",
      text: "Trag konkrete Wünsche ein oder kreuze an, worüber du dich freust.",
    },
    {
      href: `${base}/wunschlisten`,
      icon: Users,
      title: "Bei der Familie stöbern",
      text: "Schau dir die Wunschlisten an und reserviere ein Geschenk – ganz anonym.",
    },
  ];

  return (
    <Page>
      <header className="flex flex-col items-center text-center">
        <Animation name="santa" className="w-44 h-44 -mb-4" />
        <Title>Hallo {participant.name}!</Title>
        <p className="mt-2 text-cream/80">
          Willkommen beim Familien-Wichteln. So funktioniert’s:
        </p>
      </header>

      <Card holly className="flex flex-col gap-2 p-3">
        <ol className="flex flex-col gap-1">
          {steps.map(({ href, icon: Icon, title, text }, index) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex items-center gap-4 rounded-2xl p-3 transition hover:bg-white/10 active:scale-[0.98]"
              >
                <span className="relative grid place-items-center w-11 h-11 shrink-0 rounded-full bg-[radial-gradient(circle_at_35%_30%,var(--color-gold-soft),var(--color-gold)_45%,var(--color-gold-deep))] text-berry-deep shadow-[0_0_16px_rgb(248_201_74/0.4)]">
                  <Icon className="w-5 h-5" strokeWidth={2.25} aria-hidden />
                  <span className="absolute -right-1 -top-1 grid place-items-center w-5 h-5 rounded-full bg-berry text-[11px] font-extrabold text-cream ring-2 ring-night/40">
                    {index + 1}
                  </span>
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-extrabold">{title}</span>
                  <span className="block text-sm text-cream/70">{text}</span>
                </span>
                <ChevronRight
                  className="w-5 h-5 shrink-0 text-cream/50 transition group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ol>
      </Card>
    </Page>
  );
}
