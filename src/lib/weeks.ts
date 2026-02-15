// ISO week utilities

export function getCurrentWeekId(): string {
  return getWeekId(new Date());
}

export function getWeekId(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export function getWeekNumber(weekId: string): number {
  return parseInt(weekId.split("-W")[1], 10);
}

export function offsetWeek(weekId: string, offset: number): string {
  const [yearStr, weekStr] = weekId.split("-W");
  const year = parseInt(yearStr, 10);
  const week = parseInt(weekStr, 10);

  // Rough: create a date in that week, offset by 7*offset days
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - dayOfWeek + 1 + (week - 1) * 7);
  monday.setUTCDate(monday.getUTCDate() + offset * 7);

  return getWeekId(monday);
}

export function getWeekDayLabels(numSlots: number): string[] {
  const days = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"];
  return days.slice(0, numSlots);
}
