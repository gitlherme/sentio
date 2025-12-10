import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const habits = await prisma.habit.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      logs: {
        where: {
          date: {
            gte: new Date(
              new Date().setHours(0, 0, 0, 0) - 7 * 24 * 60 * 60 * 1000
            ), // Last 7 days logs
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(habits);
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const json = await req.json();
  const { title, description, frequency, period, goal, startDate, endDate } =
    json;

  const habit = await prisma.habit.create({
    data: {
      title,
      description,
      frequency,
      period,
      goal,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      userId: session.user.id,
    },
  });

  return NextResponse.json(habit);
}
