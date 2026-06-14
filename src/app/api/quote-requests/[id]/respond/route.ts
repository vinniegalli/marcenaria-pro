import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, unauthorized } from "@/lib/api-helpers";
import { sendQuoteResponseEmail } from "@/lib/email";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  const { id } = await params;

  const request = await prisma.quoteRequest.findFirst({
    where: { id, carpenterId: session.user.id },
  });

  if (!request) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  const body = await req.json();
  const { priceMin, priceMax, responseNote, validDays } = body;

  const updated = await prisma.quoteRequest.update({
    where: { id },
    data: {
      priceMin: priceMin ? parseFloat(priceMin) : null,
      priceMax: priceMax ? parseFloat(priceMax) : null,
      responseNote: responseNote || null,
      validDays: validDays ? parseInt(validDays) : null,
      status: "responded",
      respondedAt: new Date(),
    },
  });

  const carpenter = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, phone: true },
  });

  sendQuoteResponseEmail({
    to: request.clientEmail,
    clientName: request.clientName,
    carpenterName: carpenter?.name ?? "Marceneiro",
    carpenterPhone: carpenter?.phone,
    priceMin: updated.priceMin,
    priceMax: updated.priceMax,
    responseNote: updated.responseNote,
    validDays: updated.validDays,
  }).catch(() => {});

  return NextResponse.json(updated);
}
