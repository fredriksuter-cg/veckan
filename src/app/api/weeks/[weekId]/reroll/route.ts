import { NextRequest, NextResponse } from "next/server";
import { getWeek, saveWeek } from "../../store";
import recipes from "@/data/recipes.json";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ weekId: string }> }
) {
  const { weekId } = await params;
  const { slotIndex, currentIds } = await req.json();

  const plan = getWeek(weekId);
  if (!plan) {
    return NextResponse.json({ error: "No plan found" }, { status: 404 });
  }

  // Find a recipe not currently in any slot
  const usedIds = new Set(currentIds.filter(Boolean));
  const available = recipes.filter((r) => !usedIds.has(r.id));

  if (available.length === 0) {
    return NextResponse.json(plan); // No alternatives, keep current
  }

  const pick = available[Math.floor(Math.random() * available.length)];
  const newSlots = [...plan.slots];
  newSlots[slotIndex] = pick.id;

  const updated = saveWeek({ ...plan, slots: newSlots });
  return NextResponse.json(updated);
}
