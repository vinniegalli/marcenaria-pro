import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { Hammer, Calendar } from "lucide-react";
import { PublicGallery } from "@/components/public/public-gallery";
import { BudgetReviewForm } from "@/components/public/budget-review-form";

export default async function PublicProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId, status: "active" },
    include: {
      costItems: { orderBy: { createdAt: "asc" } },
      mediaFiles: { orderBy: { createdAt: "asc" } },
      client: { select: { name: true } },
      user: { select: { name: true, phone: true } },
      budgetReview: { select: { status: true } },
    },
  });

  if (!project) notFound();

  type CostItemRow = (typeof project.costItems)[number];

  const totalCost = project.costItems.reduce(
    (s: number, i: CostItemRow) => {
      const price =
        i.activeOption === "alternative" && i.altUnitPrice != null
          ? i.altUnitPrice
          : i.unitPrice;
      return s + i.quantity * price;
    },
    0,
  );
  const finalPrice = totalCost * (1 + project.marginPercent / 100);

  const reviewStatus = project.budgetReview?.status as
    | "pending"
    | "submitted"
    | undefined;

  const showReview =
    project.priceVisible &&
    (reviewStatus === "pending" || reviewStatus === "submitted") &&
    project.costItems.some((i: CostItemRow) => i.requiresReview);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="bg-amber-500 rounded-lg p-1.5">
            <Hammer className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">{project.user.name}</p>
            <p className="text-xs text-gray-500">Marcenaria</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Client greeting */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, <span className="text-amber-600">{project.client.name}</span>!
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Aqui está o resumo do seu projeto
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Project Header */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">{project.name}</h2>
            {project.description && (
              <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                {project.description}
              </p>
            )}
            <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
              <Calendar className="h-3 w-3" />
              {new Intl.DateTimeFormat("pt-BR").format(new Date(project.date))}
            </div>
          </div>

          {/* Media Gallery */}
          {project.mediaFiles.length > 0 && (
            <div className="p-4">
              <PublicGallery files={project.mediaFiles} />
            </div>
          )}

          {showReview ? (
            /* Budget Review handles the single price display */
            <div className="p-6 border-t border-gray-100">
              <BudgetReviewForm
                projectId={project.id}
                initialStatus={reviewStatus}
                marginPercent={project.marginPercent}
                initialFinalPrice={finalPrice}
                items={project.costItems
                  .filter((item: CostItemRow) => item.requiresReview)
                  .map((item: CostItemRow) => ({
                    id: item.id,
                    name: item.name,
                    category: item.category,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    altName: item.altName ?? null,
                    altUnitPrice: item.altUnitPrice ?? null,
                    activeOption: item.activeOption,
                  }))}
              />
            </div>
          ) : (
            /* Static price when no active review */
            <div className="p-6 bg-amber-50 border-t border-amber-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700 font-medium">
                    Valor do serviço
                  </p>
                  {project.priceVisible ? (
                    <p className="text-3xl font-bold text-amber-900 mt-1">
                      {formatCurrency(finalPrice)}
                    </p>
                  ) : (
                    <p className="text-base font-medium text-amber-700 mt-1 italic">
                      Orçamento em andamento…
                    </p>
                  )}
                </div>
                <div className="bg-amber-500 rounded-full p-3">
                  <Hammer className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pb-4">
          {project.user.phone && <p className="mb-1">📞 {project.user.phone}</p>}
          <p>Orçamento gerado por MarcenariaPro</p>
        </div>
      </main>
    </div>
  );
}
