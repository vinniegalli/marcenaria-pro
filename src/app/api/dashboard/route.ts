import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, unauthorized } from "@/lib/api-helpers";

export async function GET(_req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  const userId = session.user.id;

  const [totalClients, totalProjects, projects] = await Promise.all([
    prisma.client.count({ where: { userId } }),
    prisma.project.count({ where: { userId } }),
    prisma.project.findMany({
      where: { userId },
      include: { costItems: { select: { quantity: true, unitPrice: true } } },
    }),
  ]);

  const estimatedRevenue = projects.reduce(
    (sum: number, p: (typeof projects)[number]) => {
      const cost = p.costItems.reduce(
        (s: number, i: (typeof p.costItems)[number]) =>
          s + i.quantity * i.unitPrice,
        0,
      );
      return sum + cost * (1 + p.marginPercent / 100);
    },
    0,
  );

  const recentProjects = await prisma.project.findMany({
    where: { userId },
    include: { client: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return NextResponse.json({
    totalClients,
    totalProjects,
    estimatedRevenue,
    recentProjects,
  });
}
