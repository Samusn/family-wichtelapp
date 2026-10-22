import Link from "next/link";
import { ChevronRight, Gift, Lock, Sparkles, Users } from "lucide-react";
import CatalogEditor from "./CatalogEditor";
import DrawReveal from "./DrawReveal";
import WishEditor from "./WishEditor";
import type { Preferences } from "@/app/actions/catalog";
import type { Wish } from "@/app/actions/wishes";
import Animation from "@components/ui/Animation";
import Card, { CardTitle } from "@components/ui/Card";
import Page from "@components/ui/Page";
import Title, { Eyebrow } from "@components/ui/Title";

type Props = {
  participant: { name: string; token: string };
  session: { name: string; year: number; isArchived: boolean };
  drawnName: string | null;
  preferences: Preferences;
  wishes: Wish[];
};

export default function ParticipantView({
  participant,
  session,
  drawnName,
  preferences,
  wishes,
}: Props) {
  return (
    <Page>
      <header className="flex flex-col items-center gap-3 text-center">
        <Eyebrow>
          <Sparkles className="w-4 h-4" aria-hidden />
          {session.name}
        </Eyebrow>
        <Title>Hallo {participant.name}!</Title>
      </header>

      {session.isArchived && (
        <p className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm text-gold-soft ring-1 ring-white/15">
          <Lock className="w-4 h-4" aria-hidden />
          Diese Session ist archiviert.
        </p>
      )}

      <Card className="flex flex-col gap-5">
        <CardTitle icon={<Gift className="w-5 h-5" aria-hidden />}>
          Dein Wichtel-Los
        </CardTitle>
        {drawnName ? (
          <DrawReveal drawnName={drawnName} />
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <Animation name="snow-globe" className="w-48 h-48" />
            <p className="text-cream/70">
              Die Ziehung hat noch nicht stattgefunden.
              <br />
              Schau bald wieder vorbei!
            </p>
          </div>
        )}
      </Card>

      <Link
        href={`/p/${participant.token}/katalog`}
        className="group flex items-center gap-4 rounded-3xl bg-gradient-to-r from-pine to-pine-deep p-5 ring-1 ring-white/20 shadow-lg shadow-pine-deep/40 transition hover:-translate-y-0.5"
      >
        <span className="grid place-items-center w-12 h-12 shrink-0 rounded-2xl bg-white/15">
          <Users className="w-6 h-6" aria-hidden />
        </span>
        <span className="flex-1">
          <span className="block font-extrabold text-lg">Wunschkataloge</span>
          <span className="block text-sm text-cream/80">
            Schau, worüber sich die anderen freuen
          </span>
        </span>
        <ChevronRight
          className="w-6 h-6 transition group-hover:translate-x-1"
          aria-hidden
        />
      </Link>

      <WishEditor
        token={participant.token}
        wishes={wishes}
        isEditable={!session.isArchived}
      />

      <CatalogEditor
        token={participant.token}
        preferences={preferences}
        isEditable={!session.isArchived}
      />
    </Page>
  );
}
