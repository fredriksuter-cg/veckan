"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Recipe } from "@/lib/types";
import { X } from "lucide-react";

interface RecipeSheetProps {
  recipe: Recipe;
  dayLabel: string;
  onClose: () => void;
}

export default function RecipeSheet({ recipe, dayLabel, onClose }: RecipeSheetProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-[60] transition-colors duration-300 ${visible ? "bg-black/40" : "bg-black/0"}`}
      onClick={handleClose}
    >
      <div
        className={`absolute inset-0 bg-warm-50 flex flex-col transition-transform duration-300 ease-out ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <div className="absolute top-3 right-4 z-10">
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm active:bg-black/50 transition-colors"
          >
            <X size={16} color="#fff" strokeWidth={2.5} />
          </button>
        </div>

        {/* Hero image */}
        <div className="relative w-full h-72 shrink-0">
          <Image
            src={recipe.image}
            alt={recipe.name}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-5 right-5">
            {dayLabel && (
              <p className="text-xs font-medium text-white/70 uppercase tracking-wider">
                {dayLabel}
              </p>
            )}
            <h2 className="text-2xl font-bold text-white leading-tight mt-0.5">
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
      </div>
    </div>
  );
}
