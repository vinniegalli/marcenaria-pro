import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

// Map Stripe price IDs to plan names
function planFromPriceId(priceId: string): "starter" | "pro" | null {
  if (priceId === process.env.STRIPE_PRICE_STARTER) return "starter";
  if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  return null;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;
        if (!session.subscription) break;

        // Retrieve subscription to get price AND userId from metadata
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
        );
        const priceId = subscription.items.data[0]?.price.id;
        const plan = priceId ? planFromPriceId(priceId) : null;

        const userId =
          subscription.metadata?.userId ??
          (session.metadata?.userId as string | undefined);

        if (!userId || !plan) {
          console.error(
            "[webhook] checkout.session.completed: missing userId or plan",
            {
              subscriptionMetadata: subscription.metadata,
              sessionMetadata: session.metadata,
              priceId,
            },
          );
          break;
        }

        await prisma.user.update({
          where: { id: userId },
          data: {
            plan,
            stripeCustomerId: session.customer as string,
          },
        });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        if (!userId) break;

        const priceId = subscription.items.data[0]?.price.id;
        const plan = priceId ? planFromPriceId(priceId) : null;

        if (plan && subscription.status === "active") {
          await prisma.user.update({
            where: { id: userId },
            data: { plan },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        if (!userId) break;

        await prisma.user.update({
          where: { id: userId },
          data: { plan: "free" },
        });
        break;
      }

      // Handle invoice payment failure — downgrade to free
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        if (!customerId) break;

        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: { plan: "free" },
        });
        break;
      }
    }
  } catch (err) {
    console.error("[stripe-webhook]", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
