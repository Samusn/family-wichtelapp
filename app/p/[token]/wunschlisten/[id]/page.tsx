import { redirect } from "next/navigation";
import { Ban, CandyCane, Feather, ScrollText } from "lucide-react";
import { getParticipantByToken } from "@/app/actions/participants";
import { getSessionPreferences } from "@/app/actions/catalog";
import { GROUPS, getCategory } from "@/lib/catalog";
import CategoryIcon from "@components/CategoryIcon";
import WishContent from "@components/WishContent";
import BackLink from "@components/ui/BackLink";
import Card, { CardTitle } from "@components/ui/Card";
import Page from "@components/ui/Page";
import Title from "@components/ui/Title";
import ReserveButton from "./ReserveButton";

export default async function PersonWishlistPage({
  params,
}: {
  params: Promise<{ token: string; id: string }>;
}) {
  const { token, id } = await params;
  const participant = await getParticipantByToken(token);

  if (!participant || !participant.session) {
    redirect("/");
  }

  const people = await getSessionPreferences(token);
  const person = people.find((entry) => entry.key === id);

  if (!person) {
    redirect(`/p/${token}/wunschlisten`);
  }

  const isEditable = !participant.session.isArchived;
  const likes = person.choices.filter((c) => c.sentiment === "like");
  const dislikes = person.choices.filter((c) => c.sentiment === "dislike");
  const notes = GROUPS.filter((group) => person.notes[group.id]);
  const isEmpty =
    person.choices.length === 0 &&
    notes.length === 0 &&
    person.wishes.length === 0;

  return (
    <Page>
      <BackLink href={`/p/${token}/wunschlisten`} />

      <header className="text-center">
        <Title>{person.name}</Title>
      </header>

      {isEmpty && (
        <Card>
          <p className="text-center text-cream/80">
            {person.name} hat noch nichts eingetragen.
          </p>
        </Card>
      )}

      {person.wishes.length > 0 && (
        <Card holly className="flex flex-col gap-4">
          <CardTitle icon={<ScrollText aria-hidden />}>Wünscht sich</CardTitle>
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
        </Card>
      )}

      {likes.length > 0 && (
        <Card className="flex flex-col gap-4">
          <CardTitle icon={<CandyCane aria-hidden />}>
            Freut sich über
          </CardTitle>
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
                    <img
                      src={`/images/catalog/${category.id}.jpg`}
                      alt=""
                      className="w-9 h-9 shrink-0 rounded-xl object-cover"
                    />
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
        </Card>
      )}

      {notes.length > 0 && (
        <Card className="flex flex-col gap-4">
          <CardTitle icon={<Feather aria-hidden />}>Notizen</CardTitle>
          <ul className="flex flex-col gap-2">
            {notes.map((group) => (
              <li
                key={group.id}
                className="rounded-2xl bg-gold/10 p-3 text-sm ring-1 ring-gold/30"
              >
                <span className="block text-xs font-extrabold uppercase tracking-wider text-gold-soft">
                  {group.label}
                </span>
                <span className="whitespace-pre-line text-gold-soft">
                  {person.notes[group.id]}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {dislikes.length > 0 && (
        <Card className="flex flex-col gap-4">
          <CardTitle icon={<Ban aria-hidden />}>Bitte nicht</CardTitle>
          <div className="flex flex-wrap gap-2">
            {dislikes.map((choice) => {
              const category = getCategory(choice.categoryId)!;
              return (
                <span
                  key={choice.categoryId}
                  className="flex items-center gap-2 rounded-full bg-berry/20 px-3 py-1 text-sm font-semibold text-red-100 ring-1 ring-berry/40"
                >
                  <CategoryIcon categoryId={category.id} className="w-4 h-4" />
                  {category.label}
                </span>
              );
            })}
          </div>
        </Card>
      )}
    </Page>
  );
}
