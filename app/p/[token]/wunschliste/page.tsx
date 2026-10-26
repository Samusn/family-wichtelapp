import { redirect } from "next/navigation";
import { CandyCane, ScrollText } from "lucide-react";
import { getParticipantByToken } from "@/app/actions/participants";
import { getOwnPreferences } from "@/app/actions/catalog";
import { getOwnWishes } from "@/app/actions/wishes";
import { CardTitle } from "@components/ui/Card";
import Page from "@components/ui/Page";
import Title from "@components/ui/Title";
import CatalogEditor from "./CatalogEditor";
import LiveWishCount, { LikesProvider } from "./LiveWishCount";
import WishEditor from "./WishEditor";

export default async function OwnWishlistPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const participant = await getParticipantByToken(token);

  if (!participant || !participant.session) {
    redirect("/");
  }

  const [wishes, preferences] = await Promise.all([
    getOwnWishes(token),
    getOwnPreferences(token),
  ]);
  const isEditable = !participant.session.isArchived;
  const likes = preferences.choices.filter(
    (choice) => choice.sentiment === "like",
  ).length;

  return (
    <LikesProvider initialLikes={likes}>
      <Page>
        <header className="flex flex-col items-center gap-3 text-center">
          <Title>Meine Wunschliste</Title>
          <LiveWishCount wishes={wishes.length} />
        </header>

        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 px-1">
            <CardTitle icon={<ScrollText aria-hidden />}>
              Konkrete Wünsche
            </CardTitle>
            <p className="text-sm text-cream/80">
              Etwas Bestimmtes im Kopf? Füge es mit Bild oder Link hinzu.
            </p>
          </div>
          <WishEditor token={token} wishes={wishes} isEditable={isEditable} />
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 px-1">
            <CardTitle icon={<CandyCane aria-hidden />}>
              Worüber ich mich freue
            </CardTitle>
            <p className="text-sm text-cream/80">
              Öffne eine Kategorie und markiere Unterkategorien, die dir
              gefallen oder die du lieber nicht möchtest.
            </p>
          </div>
          <CatalogEditor
            token={token}
            preferences={preferences}
            isEditable={isEditable}
          />
        </section>
      </Page>
    </LikesProvider>
  );
}
