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
      participant={{ token }}
      session={{ isArchived: participant.session.isArchived }}
      draw={
        draw?.receiver
          ? {
              drawnName: draw.receiver.name,
              isRevealed: draw.revealedAt !== null,
            }
          : null
      }
    />
  );
}
