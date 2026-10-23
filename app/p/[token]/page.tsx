import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, Gift, ScrollText, Users } from "lucide-react";
import { getParticipantByToken } from "@/app/actions/participants";
import Animation from "@components/ui/Animation";
import Card from "@components/ui/Card";
import Countdown from "@components/Countdown";
import LocationMapLoader from "@components/LocationMapLoader";
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
        <div className="flex flex-col items-center">
          <span className="font-display font-bold text-shimmer text-5xl">Willkommen</span>
          <Title className="text-7xl">{participant.name}!</Title>
        </div>
        <Animation name="christmas-tenten" className="w-100 h-100 -mt-4" />
        <Countdown />
        <h2 className="mt-6 -mb-3 text-lg font-bold text-gold">So funktioniert’s</h2>
      </header>

      <Card holly className="flex flex-col p-0">
        <ol className="flex flex-col divide-y divide-white/8">
          {steps.map(({ href, icon: Icon, title, text }, index) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/6 active:bg-white/10"
              >
                <span className="relative grid place-items-center w-11 h-11 shrink-0 rounded-2xl bg-gradient-to-b from-gold-soft/20 to-gold/10 text-gold shadow-sm">
                  <Icon className="w-5 h-5" strokeWidth={2} aria-hidden />
                  <span className="absolute -right-1.5 -top-1.5 grid place-items-center w-5 h-5 rounded-full bg-berry text-[11px] font-bold text-cream">
                    {index + 1}
                  </span>
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-bold text-[15px]">{title}</span>
                  <span className="block text-[13px] leading-snug text-cream/80 mt-0.5">{text}</span>
                </span>
                <ChevronRight
                  className="w-5 h-5 shrink-0 text-cream/30 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ol>
      </Card>

      <LocationMapLoader />
    </Page>
  );
}
