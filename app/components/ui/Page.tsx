export default function Page({
  children,
  wide = false,
  className = "",
}: {
  children: React.ReactNode;
  wide?: boolean;
  className?: string;
}) {
  return (
    <main
      className={`mx-auto flex min-h-screen w-full flex-col gap-6 px-4 pt-10 pb-16 sm:px-6 sm:pt-14 ${
        wide ? "max-w-2xl" : "max-w-md"
      } ${className}`}
    >
      {children}
    </main>
  );
}
