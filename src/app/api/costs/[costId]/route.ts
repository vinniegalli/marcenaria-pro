import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { costItemSchema } from "@/lib/validations";
import {
  getAuthSession,
  unauthorized,
  notFound,
  forbidden,
} from "@/lib/api-helpers";

type Params = { params: Promise<{ costId: string }> };

async function getOwnedCostItem(costId: string, userId: string) {
  const item = await prisma.costItem.findUnique({
    where: { id: costId },
    include: { project: { select: { userId: true } } },
  });
  if (!item) return null;
  if (item.project.userId !== userId) return "forbidden";
  return item;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  const { costId } = await params;
  const item = await getOwnedCostItem(costId, session.user.id);
  if (!item) return notFound("Item não encontrado");
  if (item === "forbidden") return forbidden();

  try {
    const body = await req.json();
    const parsed = costItemSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const updated = await prisma.costItem.update({
      where: { id: costId },
      data: {
        ...(parsed.data.name && { name: parsed.data.name }),
        ...(parsed.data.category !== undefined && {
          category: parsed.data.category || null,
        }),
        ...(parsed.data.quantity !== undefined && {
          quantity: parsed.data.quantity,
        }),
        ...(parsed.data.unitPrice !== undefined && {
          unitPrice: parsed.data.unitPrice,
        }),
        ...(parsed.data.altName !== undefined && {
          altName: parsed.data.altName || null,
        }),
        ...(parsed.data.altUnitPrice !== undefined && {
          altUnitPrice: parsed.data.altUnitPrice ?? null,
        }),
        ...(parsed.data.requiresReview !== undefined && {
          requiresReview: parsed.data.requiresReview,
        }),
      },
    });

    return NextResponse.json({
      ...updated,
      total: updated.quantity * updated.unitPrice,
    });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  const { costId } = await params;
  const item = await getOwnedCostItem(costId, session.user.id);
  if (!item) return notFound("Item não encontrado");
  if (item === "forbidden") return forbidden();

  await prisma.costItem.delete({ where: { id: costId } });

  return NextResponse.json({ message: "Item excluído" });
}
