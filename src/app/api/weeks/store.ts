import { WeekPlan } from "@/lib/types";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src", "data", "weeks.json");

function readStore(): Record<string, WeekPlan> {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeStore(data: Record<string, WeekPlan>) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export function getWeek(weekId: string): WeekPlan | null {
  const store = readStore();
  return store[weekId] || null;
}

export function saveWeek(plan: WeekPlan): WeekPlan {
  const store = readStore();
  store[plan.weekId] = plan;
  writeStore(store);
  return plan;
}

export function getRecentRecipeIds(currentWeekId: string): string[] {
  const store = readStore();
  // Collect recipe IDs from all stored weeks except the current one
  const ids: string[] = [];
  for (const [weekId, plan] of Object.entries(store)) {
    if (weekId !== currentWeekId && plan.slots) {
      ids.push(...plan.slots.filter((id): id is string => id !== null));
    }
  }
  return ids;
}
