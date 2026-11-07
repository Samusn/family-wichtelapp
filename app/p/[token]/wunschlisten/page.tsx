import Link from "next/link";
import { redirect } from "next/navigation";
import { BookmarkCheck, ChevronRight } from "lucide-react";
import { getParticipantByToken } from "@/app/actions/participants";
import { getSessionPreferences } from "@/app/actions/catalog";
import Card, { CardTitle } from "@components/ui/Card";
import Page from "@components/ui/Page";
import Title from "@components/ui/Title";
import GiftWrap from "@components/GiftWrap";
import WishStats from "@components/WishStats";

export default async function WishlistsPage({
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
  const reserved = people.flatMap((person, index) =>
    person.wishes
      .filter((wish) => wish.reservation === "mine")
      .map((wish) => ({ ...wish, person, index })),
  );

  return (
    <Page>
      <header className="flex flex-col items-center gap-1 text-center">
        <Title>Wunschlisten</Title>
        <p className="text-cream/80">
          Pack ein Geschenk aus und schau, was sich deine Familie wünscht.
        </p>
      </header>

      {reserved.length > 0 && (
        <Card className="flex flex-col gap-3">
          <CardTitle icon={<BookmarkCheck aria-hidden />}>
            Von dir reserviert
          </CardTitle>
          <ul className="flex flex-col divide-y divide-white/8">
            {reserved.map((wish) => (
              <li key={wish.id}>
                <Link
                  href={`/p/${token}/wunschlisten/${wish.person.key}`}
                  className="group flex items-center gap-3 py-2.5 transition-opacity active:opacity-70"
                >
                  {wish.imageUrl ? (
                    <img
                      src={wish.imageUrl}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <GiftWrap
                      index={wish.index}
                      small
                      className="h-12 w-12 shrink-0 rounded-xl"
                    />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">
                      {wish.title}
                    </span>
                    <span className="block text-[13px] text-cream/60">
                      für {wish.person.name}
                    </span>
                  </span>
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-cream/40 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <ul className="grid grid-cols-2 gap-3">
        {people.map((person, index) => {
          const likes = person.choices.filter(
            (choice) => choice.sentiment === "like",
          ).length;
          const previews = person.wishes
            .filter((wish) => wish.imageUrl)
            .slice(0, 3);
          const isEmpty = person.wishes.length === 0 && likes === 0;
          return (
            <li key={person.key}>
              <Link
                href={`/p/${token}/wunschlisten/${person.key}`}
                className="group glass relative flex h-full flex-col overflow-hidden rounded-3xl transition active:scale-[0.98]"
              >
                <GiftWrap
                  index={index}
                  className="h-24 transition-transform duration-300 group-hover:scale-105"
                >
                  {previews.length > 0 && (
                    <span className="absolute bottom-2 right-2 flex -space-x-3">
                      {previews.map((wish) => (
                        <img
                          key={wish.id}
                          src={wish.imageUrl!}
                          alt=""
                          className="h-9 w-9 rounded-full object-cover ring-2 ring-night/60"
                        />
                      ))}
                    </span>
                  )}
                </GiftWrap>
                <span className="flex flex-1 flex-col gap-2 p-3">
                  <span className="flex items-center justify-between gap-1">
                    <span className="truncate font-display text-2xl font-bold leading-none text-gold-soft">
                      {person.name}
                    </span>
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-cream/40 transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                  {isEmpty ? (
                    <span className="text-[12px] text-cream/60">
                      Noch nichts eingetragen
                    </span>
                  ) : (
                    <WishStats count={person.wishes.length + likes} compact />
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Page>
  );
}
