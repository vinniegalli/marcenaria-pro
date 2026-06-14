import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, unauthorized } from "@/lib/api-helpers";

export async function GET(_req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });

  if (user?.plan !== "pro") {
    return NextResponse.json(
      { error: "Disponível apenas no plano Pro" },
      { status: 403 },
    );
  }

  const requests = await prisma.quoteRequest.findMany({
    where: { carpenterId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { photos: { select: { url: true } } },
  });

  return NextResponse.json(requests);
}
