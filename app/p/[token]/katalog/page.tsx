import Link from "next/link";
import { redirect } from "next/navigation";
import { Ban, Heart, StickyNote } from "lucide-react";
import { getParticipantByToken } from "@/app/actions/participants";
import { getSessionPreferences } from "@/app/actions/catalog";
import { getCategory } from "@/lib/catalog";
import CategoryIcon from "@/app/components/CategoryIcon";

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

  return (
    <div className="min-h-screen p-6 max-w-md mx-auto flex flex-col gap-6 pt-16">
      <Link
        href={`/p/${token}`}
        className="text-white/50 hover:text-white text-sm self-start transition"
      >
        ← Zurück
      </Link>

      <div>
        <p className="text-white/50 text-sm">{participant.session.name}</p>
        <h1 className="text-3xl font-bold text-white">Wunschkataloge</h1>
      </div>

      {people.map((person) => {
        const likes = person.choices.filter((c) => c.sentiment === "like");
        const dislikes = person.choices.filter(
          (c) => c.sentiment === "dislike",
        );
        const isEmpty = person.choices.length === 0 && !person.note;

        return (
          <section
            key={person.name}
            className="bg-white/10 backdrop-blur rounded-xl p-6 flex flex-col gap-4"
          >
            <h2 className="text-xl font-semibold text-white">{person.name}</h2>

            {isEmpty && (
              <p className="text-white/50">Noch nichts angekreuzt.</p>
            )}

            {likes.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                  <Heart className="w-4 h-4" aria-hidden />
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
                        className="bg-white/5 rounded-lg px-4 py-3 flex flex-col gap-2"
                      >
                        <span className="flex items-center gap-3 text-white">
                          <CategoryIcon
                            categoryId={category.id}
                            className="w-5 h-5 shrink-0 text-white/70"
                          />
                          {category.label}
                        </span>
                        {tagLabels.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {tagLabels.map((label) => (
                              <span
                                key={label}
                                className="rounded-full px-3 py-1 text-sm bg-white/10 text-white/80"
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
                <h3 className="flex items-center gap-2 text-red-400 text-sm font-semibold">
                  <Ban className="w-4 h-4" aria-hidden />
                  Bitte nicht
                </h3>
                <div className="flex flex-wrap gap-2">
                  {dislikes.map((choice) => {
                    const category = getCategory(choice.categoryId)!;
                    return (
                      <span
                        key={choice.categoryId}
                        className="flex items-center gap-2 rounded-full px-3 py-1 text-sm bg-red-500/10 text-red-300"
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

            {person.note && (
              <p className="flex gap-2 text-white/70 text-sm whitespace-pre-line">
                <StickyNote className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
                {person.note}
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}
