import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const json = await req.json();
  const { duration, taskId } = json;

  const focusSession = await prisma.focusSession.create({
    data: {
      duration,
      taskId,
      userId: session.user.id,
    },
  });

  return NextResponse.json(focusSession);
}
