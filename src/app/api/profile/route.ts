import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validations";
import { getAuthSession, unauthorized } from "@/lib/api-helpers";

export async function GET(_req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, username: true, phone: true, createdAt: true },
  });

  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  try {
    const body = await req.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone || null,
      },
      select: { id: true, name: true, email: true, username: true, phone: true },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
