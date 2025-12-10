import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function PUT(
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
  const { title, description, frequency, period } = json;

  const existingHabit = await prisma.habit.findUnique({
    where: { id },
  });

  if (!existingHabit || existingHabit.userId !== session.user.id) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const habit = await prisma.habit.update({
    where: { id },
    data: {
      title,
      description,
      frequency,
      period,
    },
  });

  return NextResponse.json(habit);
}

export async function DELETE(
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

  const existingHabit = await prisma.habit.findUnique({
    where: { id },
  });

  if (!existingHabit || existingHabit.userId !== session.user.id) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  await prisma.habit.delete({
    where: { id },
  });

  return new NextResponse(null, { status: 204 });
}
