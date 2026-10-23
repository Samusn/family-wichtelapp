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
      className={`mx-auto flex min-h-dvh w-full flex-col gap-6 px-[max(1rem,env(safe-area-inset-left),env(safe-area-inset-right))] pt-[calc(2.5rem+env(safe-area-inset-top))] pb-[calc(4rem+var(--nav-height,0rem)+env(safe-area-inset-bottom))] sm:px-[max(1.5rem,env(safe-area-inset-left),env(safe-area-inset-right))] sm:pt-[calc(3.5rem+env(safe-area-inset-top))] ${
        wide ? "max-w-2xl" : "max-w-md"
      } ${className}`}
    >
      {children}
    </main>
  );
}
