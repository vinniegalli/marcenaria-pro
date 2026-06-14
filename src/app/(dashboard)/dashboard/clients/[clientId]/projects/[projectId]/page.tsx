import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { ProjectDetail } from "@/components/projects/project-detail";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ clientId: string; projectId: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const userId = user.id;

  const { clientId, projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      costItems: { orderBy: { createdAt: "asc" } },
      mediaFiles: { orderBy: { createdAt: "asc" } },
      client: { select: { name: true, slug: true, id: true } },
      budgetReview: {
        include: {
          itemReviews: {
            include: {
              costItem: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  if (!project || project.userId !== userId || project.clientId !== clientId) {
    notFound();
  }

  const totalCost = project.costItems.reduce(
    (s: number, i: (typeof project.costItems)[number]) => {
      const price =
        i.activeOption === "alternative" && i.altUnitPrice != null
          ? i.altUnitPrice
          : i.unitPrice;
      return s + i.quantity * price;
    },
    0,
  );
  const finalPrice = totalCost * (1 + project.marginPercent / 100);
  const costItemsWithTotal = project.costItems.map(
    (i: (typeof project.costItems)[number]) => {
      const effectivePrice =
        i.activeOption === "alternative" && i.altUnitPrice != null
          ? i.altUnitPrice
          : i.unitPrice;
      return {
        ...i,
        total: i.quantity * effectivePrice,
      };
    },
  );

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true, plan: true },
  });
  const username = dbUser?.username ?? "";
  const userPlan = dbUser?.plan ?? "free";

  return (
    <ProjectDetail
      userPlan={userPlan}
      project={{
        ...project,
        costItems: costItemsWithTotal,
        mediaFiles: project.mediaFiles,
        totalCost,
        finalPrice,
        priceVisible: project.priceVisible,
        workStatus: (project.workStatus ?? "orcamento") as "orcamento" | "aprovado" | "em_producao" | "entregue",
        date: project.date.toISOString(),
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        budgetReview: project.budgetReview
          ? {
              id: project.budgetReview.id,
              projectId: project.budgetReview.projectId,
              status: project.budgetReview.status,
              sentAt: project.budgetReview.sentAt.toISOString(),
              submittedAt:
                project.budgetReview.submittedAt?.toISOString() ?? null,
              itemReviews: project.budgetReview.itemReviews.map((ir) => ({
                id: ir.id,
                costItemId: ir.costItemId,
                itemStatus: ir.itemStatus as
                  | "approved"
                  | "contested"
                  | "alternative",
                selectedOption: ir.selectedOption as "primary" | "alternative",
                comment: ir.comment,
                costItem: ir.costItem,
              })),
            }
          : null,
      }}
      username={username}
    />
  );
}
