import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getParticipantByToken } from "@/app/actions/participants";
import { getSessionPreferences } from "@/app/actions/catalog";
import Page from "@components/ui/Page";
import Title from "@components/ui/Title";

function summarize(person: {
  wishes: unknown[];
  choices: { sentiment: string }[];
}) {
  const likeCount = person.choices.filter((c) => c.sentiment === "like").length;
  const parts = [
    person.wishes.length > 0 &&
      (person.wishes.length === 1
        ? "1 Wunsch"
        : `${person.wishes.length} Wünsche`),
    likeCount > 0 && `freut sich über ${likeCount} Bereiche`,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "Noch nichts eingetragen";
}

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

  return (
    <Page>
      <header className="flex flex-col items-center gap-1 text-center">
        <Title>Wunschlisten</Title>
        <p className="text-cream/70">
          Tippe auf eine Person, um ihre Wunschliste zu sehen.
        </p>
      </header>

      <ul className="flex flex-col gap-3">
        {people.map((person) => (
          <li key={person.key}>
            <Link
              href={`/p/${token}/wunschlisten/${person.key}`}
              className="group relative flex items-center gap-4 glass rounded-3xl px-5 py-4 transition hover:brightness-125 active:scale-[0.98]"
            >
              <span className="flex-1 min-w-0">
                <span className="block truncate text-lg font-extrabold">
                  {person.name}
                </span>
                <span className="block text-sm text-cream/70">
                  {summarize(person)}
                </span>
              </span>
              <ChevronRight
                className="w-6 h-6 shrink-0 text-cream/70 transition group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </Page>
  );
}
