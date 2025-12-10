import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const json = await req.json();
  const { date, completed } = json; // date should be ISO date string

  const habit = await prisma.habit.findUnique({
    where: { id },
  });

  if (!habit || habit.userId !== session.user.id) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const targetDate = new Date(date);
  // Normalize to start of day to ensure unique constrain works per day
  targetDate.setHours(0, 0, 0, 0);

  // If completed is true, create/update log. If false, delete log (or update to false if we want to track 'missed' explicitly, but simple model deletes or sets false).
  // The schema has `completed Boolean @default(true)`.
  // We will upsert.

  const log = await prisma.habitLog.upsert({
    where: {
      habitId_date: {
        habitId: id,
        date: targetDate,
      },
    },
    update: {
      completed,
    },
    create: {
      habitId: id,
      date: targetDate,
      completed,
    },
  });

  return NextResponse.json(log);
}
