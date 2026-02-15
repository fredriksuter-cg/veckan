"use client";

import Image from "next/image";
import { Recipe } from "@/lib/types";
import { X } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex flex-col bg-warm-50">
      {/* Header */}
      <div className="px-5 pt-3 pb-3 border-b border-warm-300">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-warm-800">Välj recept</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-warm-200 active:bg-warm-300 transition-colors"
          >
            <X size={16} color="#705E4A" strokeWidth={2.5} />
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
