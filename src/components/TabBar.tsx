"use client";

import Link from "next/link";
import { CalendarDays, UtensilsCrossed } from "lucide-react";

const tabs = [
  { id: "veckan", label: "Veckan", href: "/", Icon: CalendarDays },
  { id: "recept", label: "Recept", href: "/recept", Icon: UtensilsCrossed },
];

export default function TabBar({ active }: { active: string }) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-warm-50/90 backdrop-blur-lg border-t border-warm-300 px-6 pb-8 pt-3 z-50">
      <div className="flex justify-around">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
              active === tab.id
                ? "text-warm-700"
                : "text-warm-400"
            }`}
          >
            <tab.Icon size={22} strokeWidth={active === tab.id ? 2.2 : 1.8} />
            <span>{tab.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
