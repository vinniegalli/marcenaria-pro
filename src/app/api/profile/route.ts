import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { profileSchema, usernameSchema } from "@/lib/validations";
import { getAuthSession, unauthorized } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  // Username availability check: GET /api/profile?checkUsername=foo
  const checkUsername = req.nextUrl.searchParams.get("checkUsername");
  if (checkUsername) {
    const parsed = usernameSchema.safeParse(checkUsername);
    if (!parsed.success) {
      return NextResponse.json({ available: false, error: parsed.error.issues[0].message });
    }
    const existing = await prisma.user.findUnique({
      where: { username: checkUsername },
      select: { id: true },
    });
    const available = !existing || existing.id === session.user.id;
    return NextResponse.json({ available });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      phone: true,
      plan: true,
      createdAt: true,
    },
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
        { status: 400 },
      );
    }

    // Handle optional username update
    let newUsername: string | undefined;
    if (body.username && body.username !== "") {
      const usernameParsed = usernameSchema.safeParse(body.username);
      if (!usernameParsed.success) {
        return NextResponse.json(
          { error: usernameParsed.error.issues[0].message },
          { status: 400 },
        );
      }
      const existing = await prisma.user.findUnique({
        where: { username: body.username },
        select: { id: true },
      });
      if (existing && existing.id !== session.user.id) {
        return NextResponse.json(
          { error: "Este nome de usuário já está em uso" },
          { status: 409 },
        );
      }
      newUsername = body.username;
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone || null,
        ...(newUsername && { username: newUsername }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
