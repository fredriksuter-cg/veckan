import { NextRequest, NextResponse } from "next/server";
import { getWeek, saveWeek } from "../store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ weekId: string }> }
) {
  const { weekId } = await params;
  const plan = getWeek(weekId);
  if (!plan) {
    return NextResponse.json({ weekId, slots: null });
  }
  return NextResponse.json(plan);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ weekId: string }> }
) {
  const { weekId } = await params;
  const body = await req.json();
  const plan = saveWeek({ ...body, weekId });
  return NextResponse.json(plan);
}
