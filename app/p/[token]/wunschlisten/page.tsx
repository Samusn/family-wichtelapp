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
    likeCount > 0 && `freut sich über ${likeCount} Kategorien`,
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
        <p className="text-cream/80">
          Tippe auf eine Person, um ihre Wunschliste zu sehen.
        </p>
      </header>

      <div className="glass overflow-hidden rounded-[20px]">
        <ul className="flex flex-col divide-y divide-white/8">
          {people.map((person) => (
            <li key={person.key}>
              <Link
                href={`/p/${token}/wunschlisten/${person.key}`}
                className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/6 active:bg-white/10"
              >
                <span className="grid place-items-center w-10 h-10 shrink-0 rounded-full bg-gradient-to-b from-gold-soft/25 to-gold/15 text-gold font-bold text-sm">
                  {person.name.charAt(0)}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block truncate text-[16px] font-bold">
                    {person.name}
                  </span>
                  <span className="block text-[13px] text-cream/80 mt-0.5">
                    {summarize(person)}
                  </span>
                </span>
                <ChevronRight
                  className="w-5 h-5 shrink-0 text-cream/30 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Page>
  );
}
