import Link from "next/link";
import { redirect } from "next/navigation";
import { Ban, ChevronLeft, Heart, Star, StickyNote } from "lucide-react";
import { getParticipantByToken } from "@/app/actions/participants";
import { getSessionPreferences } from "@/app/actions/catalog";
import { GROUPS, getCategory } from "@/lib/catalog";
import WishContent from "@components/WishContent";
import ReserveButton from "./ReserveButton";
import CategoryIcon from "@/app/components/CategoryIcon";
import Card from "@components/ui/Card";
import Page from "@components/ui/Page";
import Title from "@components/ui/Title";

const AVATAR_COLORS = [
  "from-berry to-berry-deep",
  "from-pine to-pine-deep",
  "from-gold to-gold-deep text-night",
];

export default async function CatalogOverviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const participant = await getParticipantByToken(token);

  if (!participant || !participant.session) {
    redirect("/");
  }

  const people = await getSessionPreferences(token);
  const isEditable = !participant.session.isArchived;

  return (
    <Page>
      <Link
        href={`/p/${token}`}
        className="flex items-center gap-1 self-start text-sm font-semibold text-cream/70 transition hover:text-cream"
      >
        <ChevronLeft className="w-4 h-4" aria-hidden />
        Zurück
      </Link>

      <header className="flex flex-col items-center gap-1 text-center">
        <Title>Wunschkataloge</Title>
        <p className="text-cream/70">{participant.session.name}</p>
      </header>

      {people.map((person, index) => {
        const likes = person.choices.filter((c) => c.sentiment === "like");
        const dislikes = person.choices.filter(
          (c) => c.sentiment === "dislike",
        );
        const notes = GROUPS.filter((group) => person.notes[group.id]);
        const isEmpty =
          person.choices.length === 0 &&
          notes.length === 0 &&
          person.wishes.length === 0;

        return (
          <Card key={person.key} className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span
                className={`grid place-items-center w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br text-xl font-extrabold ${
                  AVATAR_COLORS[index % AVATAR_COLORS.length]
                }`}
                aria-hidden
              >
                {person.name.charAt(0).toUpperCase()}
              </span>
              <h2 className="text-xl font-extrabold">{person.name}</h2>
            </div>

            {isEmpty && (
              <p className="text-cream/60">Noch nichts eingetragen.</p>
            )}

            {person.wishes.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="flex items-center gap-2 text-sm font-bold text-gold">
                  <Star className="w-4 h-4 fill-current" aria-hidden />
                  Wünscht sich
                </h3>
                <ul className="flex flex-col gap-2">
                  {person.wishes.map((wish) => (
                    <li
                      key={wish.id}
                      className={`flex items-center gap-2 rounded-2xl bg-white/5 p-2 ring-1 ring-white/10 ${
                        wish.reservation === "taken" ? "opacity-60" : ""
                      }`}
                    >
                      <WishContent wish={wish} />
                      <div className="shrink-0 pr-1">
                        <ReserveButton
                          token={token}
                          wishId={wish.id}
                          reservation={wish.reservation}
                          isEditable={isEditable}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {likes.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="flex items-center gap-2 text-sm font-bold text-pine">
                  <Heart className="w-4 h-4 fill-current" aria-hidden />
                  Freut sich über
                </h3>
                <ul className="flex flex-col gap-2">
                  {likes.map((choice) => {
                    const category = getCategory(choice.categoryId)!;
                    const tagLabels = category.tags
                      .filter((tag) => choice.tags.includes(tag.id))
                      .map((tag) => tag.label);
                    return (
                      <li
                        key={choice.categoryId}
                        className="flex flex-col gap-2 rounded-2xl bg-pine/15 p-3 ring-1 ring-pine/40"
                      >
                        <span className="flex items-center gap-3 font-bold">
                          <span className="grid place-items-center w-9 h-9 shrink-0 rounded-xl bg-pine">
                            <CategoryIcon
                              categoryId={category.id}
                              className="w-5 h-5"
                            />
                          </span>
                          {category.label}
                        </span>
                        {tagLabels.length > 0 && (
                          <div className="flex flex-wrap gap-2 pl-12">
                            {tagLabels.map((label) => (
                              <span
                                key={label}
                                className="rounded-full bg-gold px-3 py-1 text-sm font-semibold text-night"
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {dislikes.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="flex items-center gap-2 text-sm font-bold text-red-300">
                  <Ban className="w-4 h-4" aria-hidden />
                  Bitte nicht
                </h3>
                <div className="flex flex-wrap gap-2">
                  {dislikes.map((choice) => {
                    const category = getCategory(choice.categoryId)!;
                    return (
                      <span
                        key={choice.categoryId}
                        className="flex items-center gap-2 rounded-full bg-berry/20 px-3 py-1 text-sm font-semibold text-red-200 ring-1 ring-berry/40"
                      >
                        <CategoryIcon
                          categoryId={category.id}
                          className="w-4 h-4"
                        />
                        {category.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {notes.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="flex items-center gap-2 text-sm font-bold text-gold-soft">
                  <StickyNote className="w-4 h-4" aria-hidden />
                  Notizen
                </h3>
                <ul className="flex flex-col gap-2">
                  {notes.map((group) => (
                    <li
                      key={group.id}
                      className="rounded-2xl bg-gold/10 p-3 text-sm ring-1 ring-gold/30"
                    >
                      <span className="block text-xs font-extrabold uppercase tracking-wider text-gold-soft/80">
                        {group.label}
                      </span>
                      <span className="whitespace-pre-line text-gold-soft">
                        {person.notes[group.id]}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        );
      })}
    </Page>
  );
}
