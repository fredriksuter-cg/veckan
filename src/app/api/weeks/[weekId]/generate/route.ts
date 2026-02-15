import { NextRequest, NextResponse } from "next/server";
import { saveWeek, getRecentRecipeIds } from "../../store";
import recipes from "@/data/recipes.json";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ weekId: string }> }
) {
  const { weekId } = await params;
  const { numSlots = 5 } = await req.json();

  const recentIds = getRecentRecipeIds(weekId);

  // Pick recipes: prefer ones not used recently, ensure tag variety
  const available = recipes.filter((r) => !recentIds.includes(r.id));
  const pool = available.length >= numSlots ? available : [...recipes];

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const picked: typeof recipes = [];
  const usedTags = new Set<string>();

  for (const recipe of shuffled) {
    if (picked.length >= numSlots) break;
    const hasNewTag = recipe.tags.some((t) => !usedTags.has(t));
    if (hasNewTag || picked.length >= numSlots - 2) {
      picked.push(recipe);
      recipe.tags.forEach((t) => usedTags.add(t));
    }
  }

  // Fill remaining
  for (const recipe of shuffled) {
    if (picked.length >= numSlots) break;
    if (!picked.includes(recipe)) picked.push(recipe);
  }

  const plan = saveWeek({
    weekId,
    numSlots,
    slots: picked.map((r) => r.id),
  });

  return NextResponse.json(plan);
}
