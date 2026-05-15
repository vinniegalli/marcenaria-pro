import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientSchema } from "@/lib/validations";
import { getAuthSession, unauthorized } from "@/lib/api-helpers";
import { slugify } from "@/lib/utils";
import { getLimit } from "@/lib/plans";

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = 20;

  const where = {
    userId: session.user.id,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      include: { _count: { select: { projects: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.client.count({ where }),
  ]);

  return NextResponse.json({ clients, total, page, pageSize });
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  try {
    const body = await req.json();
    const parsed = clientSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { name, email, phone, notes } = parsed.data;

    // Enforce plan limit
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });
    const limit = getLimit(user?.plan ?? "free", "clients");
    const count = await prisma.client.count({
      where: { userId: session.user.id },
    });
    if (count >= limit) {
      return NextResponse.json(
        {
          error: `Seu plano permite no máximo ${limit} cliente${limit === 1 ? "" : "s"}. Faça upgrade para adicionar mais.`,
        },
        { status: 403 },
      );
    }

    // Generate unique slug per user
    let baseSlug = slugify(name);
    let slug = baseSlug;
    let counter = 1;

    while (
      await prisma.client.findUnique({
        where: { userId_slug: { userId: session.user.id, slug } },
      })
    ) {
      slug = `${baseSlug}-${counter++}`;
    }

    const client = await prisma.client.create({
      data: {
        userId: session.user.id,
        name,
        email: email || null,
        phone: phone || null,
        notes: notes || null,
        slug,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
