import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, unauthorized } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
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

  // ?pendingOnly=1 returns just the count of pending requests
  const pendingOnly = req.nextUrl.searchParams.get("pendingOnly");
  if (pendingOnly) {
    const count = await prisma.quoteRequest.count({
      where: { carpenterId: session.user.id, status: "pending" },
    });
    return NextResponse.json({ count });
  }

  const requests = await prisma.quoteRequest.findMany({
    where: { carpenterId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { photos: { select: { url: true } } },
  });

  return NextResponse.json(requests);
}
