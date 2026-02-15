"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Recipe } from "@/lib/types";
import TabBar from "@/components/TabBar";
import RecipeSheet from "@/components/RecipeSheet";

const ALL_TAGS = ["Alla", "pasta", "fisk", "kött", "vegetariskt", "snabbt", "barnvänligt", "klassiker", "soppa"];

const DUMMY_RECIPES: Recipe[] = [
  { id: "d1", name: "Pasta Puttanesca", tags: ["pasta", "snabbt"], ingredients: ["pasta", "tomater", "oliver", "kapris", "vitlök", "sardeller"], image: "/recipes/arabiata.jpg" },
  { id: "d2", name: "Kycklinggryta m curry", tags: ["kött", "barnvänligt"], ingredients: ["kyckling", "kokosmjölk", "curry", "ris", "paprika"], image: "/recipes/indisk-gryta.jpg" },
  { id: "d3", name: "Laxpudding", tags: ["fisk", "klassiker"], ingredients: ["lax", "potatis", "grädde", "ägg", "dill"], image: "/recipes/fiskgryta.jpg" },
  { id: "d4", name: "Vegetarisk lasagne", tags: ["vegetariskt", "pasta"], ingredients: ["lasagneplattor", "spenat", "ricotta", "tomat", "mozzarella"], image: "/recipes/veggo-carbonara.jpg" },
  { id: "d5", name: "Pulled pork tacos", tags: ["kött", "snabbt"], ingredients: ["fläskkarré", "tortillas", "coleslaw", "bbq-sås", "lime"], image: "/recipes/fisktacos.jpg" },
  { id: "d6", name: "Tom Kha Gai", tags: ["soppa", "snabbt"], ingredients: ["kyckling", "kokosmjölk", "galanga", "lemongrass", "lime"], image: "/recipes/linssoppa.jpg" },
];

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [tab, setTab] = useState<"mina" | "andras">("mina");
  const [activeTag, setActiveTag] = useState("Alla");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    fetch("/api/recipes")
      .then((r) => r.json())
      .then(setRecipes);
  }, []);

  const filteredDummy = DUMMY_RECIPES.filter((r) => {
    return activeTag === "Alla" || r.tags.includes(activeTag);
  });

  return (
    <div className="pb-24 min-h-dvh">
      {/* Header */}
      <div className="px-5 pt-3 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold text-warm-800">Recept</h1>
          <div className="flex bg-warm-200 rounded-full p-0.5">
            <button
              onClick={() => setTab("mina")}
              className={`px-3.5 py-1 rounded-full text-xs font-medium transition-colors ${
                tab === "mina" ? "bg-warm-700 text-white" : "text-warm-600"
              }`}
            >
              Mina
            </button>
            <button
              onClick={() => setTab("andras")}
              className={`px-3.5 py-1 rounded-full text-xs font-medium transition-colors ${
                tab === "andras" ? "bg-warm-700 text-white" : "text-warm-600"
              }`}
            >
              Andras
            </button>
          </div>
        </div>

        {/* Tag filters — only on Andras */}
        {tab === "andras" && (
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTag === tag
                    ? "bg-warm-700 text-white"
                    : "bg-warm-100 text-warm-600"
                }`}
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="px-3 pt-1">
        <div className="grid grid-cols-3 gap-1.5">
          {(tab === "mina" ? recipes : filteredDummy).map((recipe) => (
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
          {(tab === "mina" ? recipes : filteredDummy).length} recept
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
