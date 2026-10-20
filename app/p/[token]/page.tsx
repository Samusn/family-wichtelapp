import { redirect } from "next/navigation";
import { getParticipantByToken } from "@/app/actions/participants";
import { getDrawForParticipant } from "@/app/actions/draws";
import { getOwnPreferences } from "@/app/actions/catalog";
import ParticipantView from "./ParticipantView";

export default async function ParticipantPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const participant = await getParticipantByToken(token);

  if (!participant || !participant.session) {
    redirect("/");
  }

  const [draw, preferences] = await Promise.all([
    getDrawForParticipant(participant.session.id, participant.id),
    getOwnPreferences(token),
  ]);

  return (
    <ParticipantView
      participant={{
        name: participant.name,
        token,
      }}
      session={{
        name: participant.session.name,
        year: participant.session.year,
        isArchived: participant.session.isArchived,
      }}
      drawnName={draw?.receiver?.name ?? null}
      preferences={preferences}
    />
  );
}
