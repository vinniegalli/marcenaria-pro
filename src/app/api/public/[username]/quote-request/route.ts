import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendQuoteRequestEmail } from "@/lib/email";

type Params = { params: Promise<{ username: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { username } = await params;

  const carpenter = await prisma.user.findUnique({
    where: { username },
    select: { id: true, name: true, email: true, plan: true },
  });

  if (!carpenter) {
    return NextResponse.json({ error: "Marceneiro não encontrado" }, { status: 404 });
  }

  if (carpenter.plan !== "pro") {
    return NextResponse.json(
      { error: "Este marceneiro não está recebendo solicitações no momento" },
      { status: 403 },
    );
  }

  const body = await req.json();
  const { clientName, clientEmail, clientPhone, location, dimensions, description, deadline } = body;

  if (!clientName || !clientEmail || !location || !description || !deadline) {
    return NextResponse.json({ error: "Preencha todos os campos obrigatórios" }, { status: 400 });
  }

  const request = await prisma.quoteRequest.create({
    data: {
      carpenterId: carpenter.id,
      clientName,
      clientEmail,
      clientPhone: clientPhone || null,
      location,
      dimensions: dimensions || null,
      description,
      deadline,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  sendQuoteRequestEmail({
    to: carpenter.email,
    carpenterName: carpenter.name,
    clientName,
    location,
    description,
    requestUrl: `${appUrl}/dashboard/quote-requests/${request.id}`,
  }).catch(() => {});

  return NextResponse.json({ id: request.id });
}
