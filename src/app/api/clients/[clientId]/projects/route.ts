import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/validations";
import {
  getAuthSession,
  unauthorized,
  notFound,
  forbidden,
} from "@/lib/api-helpers";

type Params = { params: Promise<{ clientId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  const { clientId } = await params;

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return notFound("Cliente não encontrado");
  if (client.userId !== session.user.id) return forbidden();

  const projects = await prisma.project.findMany({
    where: { clientId },
    include: {
      _count: { select: { costItems: true, mediaFiles: true } },
      costItems: { select: { quantity: true, unitPrice: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const projectsWithTotals = projects.map((p: (typeof projects)[number]) => {
    const totalCost = p.costItems.reduce(
      (sum: number, item: (typeof p.costItems)[number]) =>
        sum + item.quantity * item.unitPrice,
      0,
    );
    const finalPrice = totalCost * (1 + p.marginPercent / 100);
    return { ...p, totalCost, finalPrice };
  });

  return NextResponse.json(projectsWithTotals);
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  const { clientId } = await params;

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return notFound("Cliente não encontrado");
  if (client.userId !== session.user.id) return forbidden();

  try {
    const body = await req.json();
    const parsed = projectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { name, description, date, marginPercent } = parsed.data;

    const project = await prisma.project.create({
      data: {
        clientId,
        userId: session.user.id,
        name,
        description: description || null,
        date: date ? new Date(date) : new Date(),
        marginPercent: marginPercent ?? 0,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
