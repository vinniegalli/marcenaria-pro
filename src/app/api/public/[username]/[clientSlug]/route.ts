import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notFound } from "@/lib/api-helpers";

type Params = { params: Promise<{ username: string; clientSlug: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { username, clientSlug } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, name: true },
  });

  if (!user) return notFound("Marceneiro não encontrado");

  const client = await prisma.client.findUnique({
    where: { userId_slug: { userId: user.id, slug: clientSlug } },
    select: { id: true, name: true },
  });

  if (!client) return notFound("Cliente não encontrado");

  const projects = await prisma.project.findMany({
    where: { clientId: client.id, status: "active" },
    include: {
      costItems: {
        select: {
          quantity: true,
          unitPrice: true,
          altUnitPrice: true,
          activeOption: true,
        },
      },
      mediaFiles: {
        select: { id: true, url: true, type: true, name: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Never expose cost breakdown — only finalPrice
  const publicProjects = projects.map((p: (typeof projects)[number]) => {
    const totalCost = p.costItems.reduce(
      (sum: number, i: (typeof p.costItems)[number]) => {
        const price =
          i.activeOption === "alternative" && i.altUnitPrice != null
            ? i.altUnitPrice
            : i.unitPrice;
        return sum + i.quantity * price;
      },
      0,
    );
    const finalPrice = totalCost * (1 + p.marginPercent / 100);
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      date: p.date,
      finalPrice,
      mediaFiles: p.mediaFiles,
    };
  });

  return NextResponse.json({
    carpenter: { name: user.name, username },
    client: { name: client.name },
    projects: publicProjects,
  });
}
