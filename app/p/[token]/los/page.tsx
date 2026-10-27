import { redirect } from "next/navigation";
import { getParticipantByToken } from "@/app/actions/participants";
import { getDrawForToken } from "@/app/actions/draws";
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

  const draw = await getDrawForToken(token);

  return (
    <ParticipantView
      participant={{ token }}
      session={{ isArchived: participant.session.isArchived }}
      draw={
        draw
          ? {
              drawnName: draw.receiverName,
              wishlistHref: `/p/${token}/wunschlisten/${draw.receiverId}`,
              isRevealed: draw.revealedAt !== null,
            }
          : null
      }
    />
  );
}
