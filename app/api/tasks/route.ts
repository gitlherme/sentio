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

  const tasks = await prisma.task.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      project: true,
      labels: {
        include: {
          label: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Transform to flat labels array if needed by frontend, or keep as is.
  // We'll keep as is for now: labels: [{ label: { ... } }, ...]
  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const json = await req.json();
  const { title, description, priority, date, dueDate, projectId, labelIds } =
    json;

  const task = await prisma.task.create({
    data: {
      title,
      description,
      priority,
      date: date ? new Date(date) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
      projectId,
      userId: session.user.id,
      labels: {
        create: labelIds?.map((id: string) => ({
          label: {
            connect: {
              id,
            },
          },
        })),
      },
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
