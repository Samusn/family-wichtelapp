import { redirect } from "next/navigation";
import { Ban, CandyCane, Feather, ScrollText } from "lucide-react";
import { getParticipantByToken } from "@/app/actions/participants";
import { getSessionPreferences } from "@/app/actions/catalog";
import { GROUPS, getCategory } from "@/lib/catalog";
import CategoryIcon from "@components/CategoryIcon";
import WishCard from "@components/WishCard";
import WishStats from "@components/WishStats";
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

      <header className="flex flex-col items-center gap-3 text-center">
        <Title>{person.name}</Title>
        {!isEmpty && <WishStats count={person.wishes.length + likes.length} />}
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
          <ul className="flex flex-col gap-3">
            {person.wishes.map((wish, index) => (
              <li key={wish.id}>
                <WishCard
                  wish={wish}
                  index={index}
                  taken={wish.reservation === "taken"}
                  highlighted={wish.reservation === "mine"}
                  footer={
                    wish.reservation !== "taken" && (
                      <ReserveButton
                        token={token}
                        wishId={wish.id}
                        reservation={wish.reservation}
                        isEditable={isEditable}
                      />
                    )
                  }
                />
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
          <ul className="grid grid-cols-2 gap-3">
            {likes.map((choice) => {
              const category = getCategory(choice.categoryId)!;
              const tagLabels = category.tags
                .filter((tag) => choice.tags.includes(tag.id))
                .map((tag) => tag.label);
              return (
                <li
                  key={choice.categoryId}
                  className="flex flex-col overflow-hidden rounded-3xl bg-pine/10 ring-1 ring-pine/40"
                >
                  <span className="relative block aspect-[4/3]">
                    <img
                      src={`/images/catalog/${category.id}.jpg`}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/20 to-transparent" />
                    <span className="absolute inset-x-3 bottom-2 font-bold leading-tight text-cream">
                      {category.label}
                    </span>
                  </span>
                  {tagLabels.length > 0 && (
                    <span className="flex flex-wrap gap-1.5 p-2.5">
                      {tagLabels.map((label) => (
                        <span
                          key={label}
                          className="rounded-full bg-gold px-2.5 py-0.5 text-[12px] font-semibold text-night"
                        >
                          {label}
                        </span>
                      ))}
                    </span>
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
