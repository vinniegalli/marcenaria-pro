import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getAuthSession, unauthorized } from "@/lib/api-helpers";

export async function POST() {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json(
      { error: "Nenhuma assinatura ativa" },
      { status: 400 },
    );
  }

  const rawUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const appUrl = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${appUrl}/dashboard/settings`,
    locale: "pt-BR",
  });

  return NextResponse.json({ url: portalSession.url });
}
