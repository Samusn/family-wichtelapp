"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gift, House, ScrollText, Users } from "lucide-react";

export default function BottomNav({ token }: { token: string }) {
  const pathname = usePathname();
  const base = `/p/${token}`;
  const tabs = [
    { href: base, label: "Start", icon: House, active: pathname === base },
    {
      href: `${base}/los`,
      label: "Mein Los",
      icon: Gift,
      active: pathname.startsWith(`${base}/los`),
    },
    {
      href: `${base}/wunschliste`,
      label: "Meine Liste",
      icon: ScrollText,
      active:
        pathname.startsWith(`${base}/wunschliste`) &&
        !pathname.startsWith(`${base}/wunschlisten`),
    },
    {
      href: `${base}/wunschlisten`,
      label: "Familie",
      icon: Users,
      active: pathname.startsWith(`${base}/wunschlisten`),
    },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 px-[max(1rem,env(safe-area-inset-left),env(safe-area-inset-right))]">
      <ul className="glass relative mx-auto flex max-w-md rounded-full p-1.5">
        {tabs.map(({ href, label, icon: Icon, active }) => (
          <li key={href} className="flex-1">
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-full text-xs font-bold transition duration-300 active:scale-95 ${
                active
                  ? "bg-white/15 text-gold shadow-[inset_1px_1px_1px_rgb(255_255_255/0.3),0_2px_10px_rgb(0_0_0/0.2)]"
                  : "text-cream/70 hover:text-cream"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${active ? "fill-gold/30" : ""}`}
                aria-hidden
              />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
