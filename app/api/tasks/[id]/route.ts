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
  const {
    title,
    description,
    completed,
    priority,
    date,
    dueDate,
    projectId,
    labelIds,
  } = json;

  // First check ownership
  const existingTask = await prisma.task.findUnique({
    where: { id },
  });

  if (!existingTask || existingTask.userId !== session.user.id) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Handle labels update if provided
  let labelsUpdate = {};
  if (labelIds) {
    labelsUpdate = {
      labels: {
        deleteMany: {},
        create: labelIds.map((lid: string) => ({
          label: {
            connect: { id: lid },
          },
        })),
      },
    };
  }

  const task = await prisma.task.update({
    where: { id },
    data: {
      title,
      description,
      completed,
      priority,
      date: date ? new Date(date) : undefined, // undefined to ignore if not sent, but usually we send null to clear
      dueDate: dueDate ? new Date(dueDate) : undefined,
      projectId,
      ...labelsUpdate,
    },
    include: {
      project: true,
      labels: {
        include: {
          label: true,
        },
      },
    },
  });

  return NextResponse.json(task);
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

  const existingTask = await prisma.task.findUnique({
    where: { id },
  });

  if (!existingTask || existingTask.userId !== session.user.id) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  await prisma.task.delete({
    where: { id },
  });

  return new NextResponse(null, { status: 204 });
}
