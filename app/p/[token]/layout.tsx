import BottomNav from "./BottomNav";

export default async function ParticipantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="[--nav-height:5.5rem]">
      {children}
      <BottomNav token={token} />
    </div>
  );
}
