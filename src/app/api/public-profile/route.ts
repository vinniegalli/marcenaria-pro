import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, unauthorized } from "@/lib/api-helpers";

export async function GET(_req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  const profile = await prisma.publicProfile.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json(profile ?? {});
}

export async function PATCH(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });

  if (user?.plan !== "pro") {
    return NextResponse.json(
      { error: "Disponível apenas no plano Pro" },
      { status: 403 },
    );
  }

  const body = await req.json();
  const { bio, city, serviceArea, whatsapp, instagram } = body;

  const profile = await prisma.publicProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      bio: bio || null,
      city: city || null,
      serviceArea: serviceArea || null,
      whatsapp: whatsapp || null,
      instagram: instagram || null,
    },
    update: {
      bio: bio || null,
      city: city || null,
      serviceArea: serviceArea || null,
      whatsapp: whatsapp || null,
      instagram: instagram || null,
    },
  });

  return NextResponse.json(profile);
}
