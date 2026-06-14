import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendReviewSubmittedEmail } from "@/lib/email";

const reviewSubmitSchema = z.object({
  items: z.array(
    z.object({
      costItemId: z.string(),
      itemStatus: z.enum(["approved", "contested", "alternative"]),
      selectedOption: z.enum(["primary", "alternative"]).default("primary"),
      comment: z.string().optional(),
    }),
  ),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;

  try {
    const body = await req.json();
    const parsed = reviewSubmitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const { items } = parsed.data;

    const project = await prisma.project.findUnique({
      where: { id: projectId, status: "active" },
      include: {
        client: { select: { name: true } },
        user: { select: { email: true, name: true } },
      },
    });
    if (!project) {
      return NextResponse.json(
        { error: "Projeto não encontrado" },
        { status: 404 },
      );
    }

    const budgetReview = await prisma.budgetReview.findUnique({
      where: { projectId },
    });
    if (!budgetReview) {
      return NextResponse.json(
        { error: "Orçamento não enviado para revisão" },
        { status: 400 },
      );
    }

    // Only allow costItemIds that belong to this project (prevents IDOR)
    const projectCostItems = await prisma.costItem.findMany({
      where: { projectId: project.id },
      select: { id: true },
    });
    const validCostItemIds = new Set(projectCostItems.map((c) => c.id));

    for (const item of items) {
      if (!validCostItemIds.has(item.costItemId)) {
        return NextResponse.json({ error: "Item inválido" }, { status: 400 });
      }
    }

    for (const item of items) {
      await prisma.budgetItemReview.upsert({
        where: {
          budgetReviewId_costItemId: {
            budgetReviewId: budgetReview.id,
            costItemId: item.costItemId,
          },
        },
        create: {
          budgetReviewId: budgetReview.id,
          costItemId: item.costItemId,
          itemStatus: item.itemStatus,
          selectedOption: item.selectedOption,
          comment: item.comment ?? null,
        },
        update: {
          itemStatus: item.itemStatus,
          selectedOption: item.selectedOption,
          comment: item.comment ?? null,
        },
      });

      const newActiveOption =
        item.itemStatus !== "contested" && item.selectedOption === "alternative"
          ? "alternative"
          : "primary";

      await prisma.costItem.update({
        where: { id: item.costItemId },
        data: { activeOption: newActiveOption },
      });
    }

    await prisma.budgetReview.update({
      where: { id: budgetReview.id },
      data: { status: "submitted", submittedAt: new Date() },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://marcenariaproo.com.br";
    sendReviewSubmittedEmail({
      to: project.user.email,
      carpenterName: project.user.name ?? project.user.email,
      clientName: project.client.name,
      projectName: project.name,
      projectUrl: `${appUrl}/dashboard/clients/${project.clientId}/projects/${project.id}`,
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erro ao enviar revisão" },
      { status: 500 },
    );
  }
}
