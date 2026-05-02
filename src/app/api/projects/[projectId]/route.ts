import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validations";
import {
  getAuthSession,
  unauthorized,
  notFound,
  forbidden,
} from "@/lib/api-helpers";

type Params = { params: Promise<{ projectId: string }> };

async function getOwnedProject(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return null;
  if (project.userId !== userId) return "forbidden";
  return project;
}

function calcTotals(
  costItems: { quantity: number; unitPrice: number }[],
  marginPercent: number,
) {
  const totalCost = costItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const finalPrice = totalCost * (1 + marginPercent / 100);
  return { totalCost, finalPrice };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  const { projectId } = await params;
  const check = await getOwnedProject(projectId, session.user.id);
  if (!check) return notFound("Projeto não encontrado");
  if (check === "forbidden") return forbidden();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      costItems: { orderBy: { createdAt: "asc" } },
      mediaFiles: { orderBy: { createdAt: "asc" } },
      client: { select: { name: true, slug: true } },
    },
  });

  if (!project) return notFound("Projeto não encontrado");

  const { totalCost, finalPrice } = calcTotals(
    project.costItems,
    project.marginPercent,
  );
  const costItemsWithTotal = project.costItems.map(
    (i: (typeof project.costItems)[number]) => ({
      ...i,
      total: i.quantity * i.unitPrice,
    }),
  );

  return NextResponse.json({
    ...project,
    costItems: costItemsWithTotal,
    totalCost,
    finalPrice,
  });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  const { projectId } = await params;
  const check = await getOwnedProject(projectId, session.user.id);
  if (!check) return notFound("Projeto não encontrado");
  if (check === "forbidden") return forbidden();

  try {
    const body = await req.json();
    const parsed = projectSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(parsed.data.name && { name: parsed.data.name }),
        ...(parsed.data.description !== undefined && {
          description: parsed.data.description || null,
        }),
        ...(parsed.data.date && { date: new Date(parsed.data.date) }),
        ...(parsed.data.marginPercent !== undefined && {
          marginPercent: parsed.data.marginPercent,
        }),
        ...(parsed.data.priceVisible !== undefined && {
          priceVisible: parsed.data.priceVisible,
        }),
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  const { projectId } = await params;
  const check = await getOwnedProject(projectId, session.user.id);
  if (!check) return notFound("Projeto não encontrado");
  if (check === "forbidden") return forbidden();

  await prisma.project.delete({ where: { id: projectId } });

  return NextResponse.json({ message: "Projeto excluído" });
}
