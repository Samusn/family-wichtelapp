import { Lock } from "lucide-react";
import DrawReveal from "./DrawReveal";
import Animation from "@components/ui/Animation";
import Card from "@components/ui/Card";
import Page from "@components/ui/Page";
import Title from "@components/ui/Title";

type Props = {
  participant: { token: string };
  session: { isArchived: boolean };
  draw: {
    drawnName: string;
    wishlistHref: string;
    isRevealed: boolean;
  } | null;
};

export default function ParticipantView({ participant, session, draw }: Props) {
  return (
    <Page>
      <header className="text-center">
        <Title>Dein Wichtel-Los</Title>
      </header>

      {session.isArchived && (
        <p className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm text-gold-soft ring-1 ring-white/15">
          <Lock className="w-4 h-4" aria-hidden />
          Diese Session ist archiviert.
        </p>
      )}

      <Card
        holly
        className="flex flex-1 flex-col items-center justify-center gap-5"
      >
        {draw ? (
          <DrawReveal
            token={participant.token}
            drawnName={draw.drawnName}
            wishlistHref={draw.wishlistHref}
            isRevealed={draw.isRevealed}
          />
        ) : (
          <div className="flex h-[32rem] flex-col items-center justify-center gap-2 text-center">
            <Animation name="snow-globe" className="w-48 h-48" />
            <p className="text-cream/80">
              Die Ziehung hat noch nicht stattgefunden.
              <br />
              Schau bald wieder vorbei!
            </p>
          </div>
        )}
      </Card>
    </Page>
  );
}
