import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supplyItemSchema } from "@/lib/validations";
import { getAuthSession, unauthorized } from "@/lib/api-helpers";
import { getLimit } from "@/lib/plans";

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = 50;

  const where = {
    userId: session.user.id,
    ...(search
      ? { name: { contains: search, mode: "insensitive" as const } }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.supplyItem.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.supplyItem.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, pageSize });
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  try {
    const body = await req.json();
    const parsed = supplyItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    // Enforce supply items limit
    const userPlan = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });
    const limit = getLimit(userPlan?.plan ?? "free", "supplyItems");
    const count = await prisma.supplyItem.count({
      where: { userId: session.user.id },
    });
    if (count >= limit) {
      return NextResponse.json(
        {
          error: `Seu plano permite no máximo ${limit} ite${limit === 1 ? "m" : "ns"} de insumo. Faça upgrade para adicionar mais.`,
        },
        { status: 403 },
      );
    }

    const item = await prisma.supplyItem.create({
      data: { ...parsed.data, userId: session.user.id },
    });

    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar item" }, { status: 500 });
  }
}
