import { Archive } from "lucide-react";
import { getParticipantByToken } from "@/app/actions/participants";
import BottomNav from "./BottomNav";

export default async function ParticipantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const participant = await getParticipantByToken(token);
  const session = participant?.session;

  return (
    <div className="relative [--nav-height:5.5rem]">
      {session?.isArchived && (
        <span className="glass absolute right-[max(1rem,env(safe-area-inset-right))] top-[calc(1.75rem+env(safe-area-inset-top))] z-30 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold text-gold-soft">
          <Archive className="w-3.5 h-3.5" aria-hidden />
          Archiviert · {session.year}
        </span>
      )}
      {children}
      <BottomNav token={token} />
    </div>
  );
}
