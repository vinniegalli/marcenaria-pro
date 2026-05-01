import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { costItemSchema } from "@/lib/validations";
import { getAuthSession, unauthorized, notFound, forbidden } from "@/lib/api-helpers";

type Params = { params: Promise<{ projectId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  const { projectId } = await params;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return notFound("Projeto não encontrado");
  if (project.userId !== session.user.id) return forbidden();

  try {
    const body = await req.json();
    const parsed = costItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, category, quantity, unitPrice } = parsed.data;

    const item = await prisma.costItem.create({
      data: { projectId, name, category: category || null, quantity, unitPrice },
    });

    return NextResponse.json({ ...item, total: item.quantity * item.unitPrice }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
