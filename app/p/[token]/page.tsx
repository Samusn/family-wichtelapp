import { redirect } from "next/navigation";
import { getParticipantByToken } from "@/app/actions/participants";
import { getDrawForParticipant } from "@/app/actions/draws";
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

  const draw = await getDrawForParticipant(
    participant.session.id,
    participant.id,
  );

  return (
    <ParticipantView
      participant={{
        id: participant.id,
        name: participant.name,
        token,
      }}
      session={{
        name: participant.session.name,
        year: participant.session.year,
        isArchived: participant.session.isArchived,
      }}
      drawnName={draw?.receiver?.name ?? null}
    />
  );
}
