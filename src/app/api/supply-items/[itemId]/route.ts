import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, unauthorized } from "@/lib/api-helpers";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1, "Informe o nome").optional(),
  category: z.string().optional(),
  unitPrice: z.coerce.number().min(0, "Valor não pode ser negativo").optional(),
});

async function getOwnedItem(itemId: string, userId: string) {
  return prisma.supplyItem.findFirst({ where: { id: itemId, userId } });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
) {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  const { itemId } = await params;
  const item = await getOwnedItem(itemId, session.user.id);
  if (!item)
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const updated = await prisma.supplyItem.update({
      where: { id: itemId },
      data: parsed.data,
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Erro ao atualizar item" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
) {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  const { itemId } = await params;
  const item = await getOwnedItem(itemId, session.user.id);
  if (!item)
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  await prisma.supplyItem.delete({ where: { id: itemId } });
  return NextResponse.json({ message: "Item removido" });
}
