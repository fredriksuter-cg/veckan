import { Recipe, WeekPlan } from "./types";
import recipesData from "@/data/recipes.json";

// In-memory cache (reads from JSON files, writes via API routes)
let recipes: Recipe[] = recipesData as Recipe[];

export function getRecipes(): Recipe[] {
  return recipes;
}

export function getRecipeById(id: string): Recipe | undefined {
  return recipes.find((r) => r.id === id);
}

export function getRecipesByIds(ids: (string | null)[]): (Recipe | null)[] {
  return ids.map((id) => (id ? getRecipeById(id) || null : null));
}

// Generate a week plan using simple "AI" logic
// Avoids recently used recipes, ensures variety across tags
export function generateWeekPlan(
  numSlots: number,
  recentRecipeIds: string[] = []
): string[] {
  const available = recipes.filter((r) => !recentRecipeIds.includes(r.id));
  const pool = available.length >= numSlots ? available : [...recipes];

  // Shuffle and pick, trying to avoid tag duplicates
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const picked: Recipe[] = [];
  const usedTags = new Set<string>();

  for (const recipe of shuffled) {
    if (picked.length >= numSlots) break;

    // Prefer recipes that bring a new tag
    const hasNewTag = recipe.tags.some((t) => !usedTags.has(t));
    if (hasNewTag || picked.length >= numSlots - 2) {
      picked.push(recipe);
      recipe.tags.forEach((t) => usedTags.add(t));
    }
  }

  // Fill remaining if needed
  while (picked.length < numSlots) {
    const remaining = shuffled.find((r) => !picked.includes(r));
    if (remaining) picked.push(remaining);
    else break;
  }

  return picked.map((r) => r.id);
}
