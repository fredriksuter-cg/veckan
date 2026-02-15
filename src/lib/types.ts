export interface Recipe {
  id: string;
  name: string;
  tags: string[];
  ingredients: string[];
  image: string;
}

export interface WeekPlan {
  weekId: string; // e.g. "2026-W08"
  slots: (string | null)[]; // recipe IDs, null = empty slot
  numSlots: number;
}
