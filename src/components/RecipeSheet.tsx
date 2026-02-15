"use client";

import Image from "next/image";
import { Recipe } from "@/lib/types";

interface RecipeSheetProps {
  recipe: Recipe;
  dayLabel: string;
  onClose: () => void;
}

export default function RecipeSheet({ recipe, dayLabel, onClose }: RecipeSheetProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col" onClick={onClose}>
      <div
        className="mt-auto max-h-[85dvh] bg-white rounded-t-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-warm-300" />
        </div>

        {/* Hero image */}
        <div className="relative w-full h-56 shrink-0">
          <Image
            src={recipe.image}
            alt={recipe.name}
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <p className="text-xs font-medium text-white/70 uppercase tracking-wider">
              {dayLabel}
            </p>
            <h2 className="text-xl font-bold text-white leading-tight mt-0.5">
              {recipe.name}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Tags */}
          {recipe.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-4">
              {recipe.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full bg-warm-100 text-warm-600 text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Ingredients */}
          <h3 className="text-sm font-semibold text-warm-800 uppercase tracking-wider mb-2">
            Ingredienser
          </h3>
          <ul className="space-y-1.5 mb-6">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex items-center gap-2 text-warm-700">
                <span className="w-1.5 h-1.5 rounded-full bg-warm-400 shrink-0" />
                <span className="text-sm">{ing}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Close button */}
        <div className="px-5 pb-8 pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-warm-100 text-warm-700 text-sm font-medium active:bg-warm-200 transition-colors"
          >
            Stäng
          </button>
        </div>
      </div>
    </div>
  );
}
