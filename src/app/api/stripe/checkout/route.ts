import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_PRICE_IDS, BillingPlan } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getAuthSession, unauthorized } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) return unauthorized();

    const body = await req.json();
    const plan = body.plan as BillingPlan;

    if (!plan || plan === "free") {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
    }

    const priceId = STRIPE_PRICE_IDS[plan];
    if (!priceId) {
      return NextResponse.json(
        { error: "Plano não configurado" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, stripeCustomerId: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 },
      );
    }

    // Reuse existing Stripe customer or create a new one
    let customerId = user.stripeCustomerId;
    if (customerId) {
      // Validate the customer still exists in the current Stripe environment
      try {
        await stripe.customers.retrieve(customerId);
      } catch {
        // Customer not found (e.g. test-mode ID used in live mode) — create a new one
        customerId = null;
      }
    }
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const rawUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const appUrl = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard/settings?upgraded=1`,
      cancel_url: `${appUrl}/pricing?canceled=1`,
      subscription_data: {
        metadata: { userId: user.id, plan },
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      locale: "pt-BR",
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    const message = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
