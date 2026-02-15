"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Recipe } from "@/lib/types";
import TabBar from "@/components/TabBar";
import RecipeSheet from "@/components/RecipeSheet";

const ALL_TAGS = ["Alla", "pasta", "fisk", "kött", "vegetariskt", "snabbt", "barnvänligt", "klassiker", "soppa"];

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("Alla");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    fetch("/api/recipes")
      .then((r) => r.json())
      .then(setRecipes);
  }, []);

  const filtered = recipes.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchesTag = activeTag === "Alla" || r.tags.includes(activeTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="pb-24 min-h-dvh">
      {/* Header */}
      <div className="px-5 pt-14 pb-2">
        <h1 className="text-2xl font-bold text-warm-800 mb-4">Mina recept</h1>
        <input
          type="text"
          placeholder="Sök recept..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-warm-100 text-warm-800 placeholder:text-warm-400 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-warm-300 mb-3"
        />
        {/* Tag filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeTag === tag
                  ? "bg-warm-700 text-white"
                  : "bg-warm-100 text-warm-600 hover:bg-warm-200"
              }`}
            >
              {tag.charAt(0).toUpperCase() + tag.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* 3-column grid */}
      <div className="px-3 pt-2">
        <div className="grid grid-cols-3 gap-1.5">
          {filtered.map((recipe) => (
            <button
              key={recipe.id}
              onClick={() => setSelectedRecipe(recipe)}
              className="relative aspect-square rounded-xl overflow-hidden"
            >
              <Image
                src={recipe.image}
                alt={recipe.name}
                fill
                className="object-cover pointer-events-none"
                sizes="33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
              <p className="absolute bottom-1.5 left-2 right-2 text-[11px] font-medium text-white leading-tight text-left pointer-events-none">
                {recipe.name}
              </p>
            </button>
          ))}
        </div>
        <p className="text-center text-warm-400 text-xs mt-4">
          {filtered.length} recept
        </p>
      </div>

      {selectedRecipe && (
        <RecipeSheet
          recipe={selectedRecipe}
          dayLabel=""
          onClose={() => setSelectedRecipe(null)}
        />
      )}

      <TabBar active="recept" />
    </div>
  );
}
