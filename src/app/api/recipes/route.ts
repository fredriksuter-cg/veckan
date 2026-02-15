import { NextResponse } from "next/server";
import recipes from "@/data/recipes.json";

export async function GET() {
  return NextResponse.json(recipes);
}
