import { WeekPlan } from "@/lib/types";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src", "data", "weeks.json");

// In-memory store seeded from JSON file (works on Vercel where filesystem is read-only)
let memoryStore: Record<string, WeekPlan> | null = null;

function getStore(): Record<string, WeekPlan> {
  if (!memoryStore) {
    try {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      memoryStore = JSON.parse(raw);
    } catch {
      memoryStore = {};
    }
  }
  return memoryStore!;
}

export function getWeek(weekId: string): WeekPlan | null {
  const store = getStore();
  return store[weekId] || null;
}

export function saveWeek(plan: WeekPlan): WeekPlan {
  const store = getStore();
  store[plan.weekId] = plan;

  // Try to persist to file (works locally, fails silently on Vercel)
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
  } catch {
    // Read-only filesystem (Vercel) — in-memory only
  }

  return plan;
}

export function getRecentRecipeIds(currentWeekId: string): string[] {
  const store = getStore();
  const ids: string[] = [];
  for (const [weekId, plan] of Object.entries(store)) {
    if (weekId !== currentWeekId && plan.slots) {
      ids.push(...plan.slots.filter((id): id is string => id !== null));
    }
  }
  return ids;
}
