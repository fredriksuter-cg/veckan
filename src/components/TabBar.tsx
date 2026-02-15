"use client";

import Link from "next/link";

const tabs = [
  { id: "veckan", label: "Veckan", href: "/", icon: "📅" },
  { id: "recept", label: "Recept", href: "/recept", icon: "🍽️" },
];

export default function TabBar({ active }: { active: string }) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/90 backdrop-blur-lg border-t border-warm-200/50 px-6 pb-8 pt-3 z-50">
      <div className="flex justify-around">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
              active === tab.id
                ? "text-warm-700"
                : "text-warm-400 hover:text-warm-500"
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
