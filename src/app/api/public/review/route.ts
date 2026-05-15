import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reviewSubmitSchema = z.object({
  projectId: z.string(),
  items: z.array(
    z.object({
      costItemId: z.string(),
      itemStatus: z.enum(["approved", "contested", "alternative"]),
      selectedOption: z.enum(["primary", "alternative"]).default("primary"),
      comment: z.string().optional(),
    }),
  ),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = reviewSubmitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const { projectId, items } = parsed.data;

    const project = await prisma.project.findUnique({
      where: { id: projectId, status: "active" },
      select: { id: true },
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

    // Prevent a client from sending costItemIds from other projects
    const projectCostItems = await prisma.costItem.findMany({
      where: { projectId: project.id },
      select: { id: true },
    });
    const validCostItemIds = new Set(
      projectCostItems.map((c: { id: string }) => c.id),
    );

    for (const item of items) {
      if (!validCostItemIds.has(item.costItemId)) {
        return NextResponse.json({ error: "Item inválido" }, { status: 400 });
      }
    }

    // Upsert each item review and update CostItem.activeOption
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

      // Contested items keep the primary option active (marceneiro will resolve)
      const newActiveOption =
        item.itemStatus !== "contested" && item.selectedOption === "alternative"
          ? "alternative"
          : "primary";

      await prisma.costItem.update({
        where: { id: item.costItemId },
        data: { activeOption: newActiveOption },
      });
    }

    // Mark as submitted
    await prisma.budgetReview.update({
      where: { id: budgetReview.id },
      data: { status: "submitted", submittedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/public/review]", err);
    return NextResponse.json(
      { error: "Erro ao enviar revisão" },
      { status: 500 },
    );
  }
}
