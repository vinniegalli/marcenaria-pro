import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, unauthorized } from "@/lib/api-helpers";

const budgetReviewInclude = {
  itemReviews: {
    include: {
      costItem: {
        select: {
          id: true,
          name: true,
          category: true,
          quantity: true,
          unitPrice: true,
        },
      },
    },
    orderBy: { createdAt: "asc" as const },
  },
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  const { projectId } = await params;

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
    select: { id: true },
  });
  if (!project)
    return NextResponse.json(
      { error: "Projeto não encontrado" },
      { status: 404 },
    );

  const review = await prisma.budgetReview.findUnique({
    where: { projectId },
    include: budgetReviewInclude,
  });

  return NextResponse.json({ review });
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  const { projectId } = await params;

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
    select: { id: true },
  });
  if (!project)
    return NextResponse.json(
      { error: "Projeto não encontrado" },
      { status: 404 },
    );

  // Upsert the budget review — resets status to "pending" and clears previous item reviews
  const existing = await prisma.budgetReview.findUnique({
    where: { projectId },
  });

  let review;
  if (existing) {
    // Delete all previous item reviews so client can re-review from scratch
    await prisma.budgetItemReview.deleteMany({
      where: { budgetReviewId: existing.id },
    });
    review = await prisma.budgetReview.update({
      where: { projectId },
      data: { status: "pending", sentAt: new Date(), submittedAt: null },
      include: budgetReviewInclude,
    });
  } else {
    review = await prisma.budgetReview.create({
      data: { projectId, status: "pending" },
      include: budgetReviewInclude,
    });
  }

  return NextResponse.json({ review });
}

export async function PUT(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  const { projectId } = await params;

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
    select: { id: true },
  });
  if (!project)
    return NextResponse.json(
      { error: "Projeto não encontrado" },
      { status: 404 },
    );

  const review = await prisma.budgetReview.findUnique({
    where: { projectId },
  });
  if (!review || review.status !== "submitted")
    return NextResponse.json(
      { error: "Nenhuma revisão pendente de confirmação" },
      { status: 400 },
    );

  const confirmed = await prisma.budgetReview.update({
    where: { projectId },
    data: { status: "confirmed" },
    include: {
      ...budgetReviewInclude,
    },
  });

  return NextResponse.json({ review: confirmed });
}
