import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientSchema } from "@/lib/validations";
import { getAuthSession, unauthorized, notFound, forbidden } from "@/lib/api-helpers";

type Params = { params: Promise<{ clientId: string }> };

async function getOwnedClient(clientId: string, userId: string) {
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return null;
  if (client.userId !== userId) return "forbidden";
  return client;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  const { clientId } = await params;
  const client = await getOwnedClient(clientId, session.user.id);
  if (!client) return notFound("Cliente não encontrado");
  if (client === "forbidden") return forbidden();

  const full = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      projects: {
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { costItems: true, mediaFiles: true } } },
      },
    },
  });

  return NextResponse.json(full);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  const { clientId } = await params;
  const client = await getOwnedClient(clientId, session.user.id);
  if (!client) return notFound("Cliente não encontrado");
  if (client === "forbidden") return forbidden();

  try {
    const body = await req.json();
    const parsed = clientSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const updated = await prisma.client.update({
      where: { id: clientId },
      data: {
        ...(parsed.data.name && { name: parsed.data.name }),
        ...(parsed.data.email !== undefined && { email: parsed.data.email || null }),
        ...(parsed.data.phone !== undefined && { phone: parsed.data.phone || null }),
        ...(parsed.data.notes !== undefined && { notes: parsed.data.notes || null }),
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

  const { clientId } = await params;
  const client = await getOwnedClient(clientId, session.user.id);
  if (!client) return notFound("Cliente não encontrado");
  if (client === "forbidden") return forbidden();

  await prisma.client.delete({ where: { id: clientId } });

  return NextResponse.json({ message: "Cliente excluído" });
}
