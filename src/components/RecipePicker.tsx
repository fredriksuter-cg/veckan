"use client";

import Image from "next/image";
import { Recipe } from "@/lib/types";

interface RecipePickerProps {
  recipes: Recipe[];
  currentIds: (string | null)[];
  onPick: (recipeId: string) => void;
  onClose: () => void;
}

export default function RecipePicker({
  recipes,
  currentIds,
  onPick,
  onClose,
}: RecipePickerProps) {
  const available = recipes.filter((r) => !currentIds.includes(r.id));

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="px-5 pt-14 pb-3 border-b border-warm-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-warm-800">Välj recept</h2>
          <button
            onClick={onClose}
            className="text-warm-500 text-sm font-medium"
          >
            Avbryt
          </button>
        </div>
      </div>

      {/* 3-column grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-3 gap-2">
          {available.map((recipe) => (
            <button
              key={recipe.id}
              onClick={() => onPick(recipe.id)}
              className="relative aspect-square rounded-xl overflow-hidden active:scale-[0.95] transition-transform"
            >
              <Image
                src={recipe.image}
                alt={recipe.name}
                fill
                className="object-cover pointer-events-none"
                sizes="33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
              <p className="absolute bottom-1.5 left-1.5 right-1.5 text-[11px] font-medium text-white leading-tight pointer-events-none">
                {recipe.name}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
