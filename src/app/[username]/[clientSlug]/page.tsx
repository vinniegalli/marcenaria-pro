import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { Hammer, Calendar } from "lucide-react";
import { PublicGallery } from "@/components/public/public-gallery";
import { BudgetReviewForm } from "@/components/public/budget-review-form";

export default async function PublicClientPage({
  params,
}: {
  params: Promise<{ username: string; clientSlug: string }>;
}) {
  const { username, clientSlug } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, name: true, phone: true },
  });

  if (!user) notFound();

  const client = await prisma.client.findUnique({
    where: { userId_slug: { userId: user.id, slug: clientSlug } },
    select: { id: true, name: true },
  });

  if (!client) notFound();

  const projects = await prisma.project.findMany({
    where: { clientId: client.id, status: "active" },
    include: {
      costItems: {
        orderBy: { createdAt: "asc" },
      },
      mediaFiles: { orderBy: { createdAt: "asc" } },
      budgetReview: {
        select: { status: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const publicProjects = projects.map((p: (typeof projects)[number]) => {
    const totalCost = p.costItems.reduce(
      (s: number, i: (typeof p.costItems)[number]) => {
        const price =
          i.activeOption === "alternative" && i.altUnitPrice != null
            ? i.altUnitPrice
            : i.unitPrice;
        return s + i.quantity * price;
      },
      0,
    );
    const finalPrice = totalCost * (1 + p.marginPercent / 100);
    const fixedItemsCost = p.costItems
      .filter((i: (typeof p.costItems)[number]) => !i.requiresReview)
      .reduce((s: number, i: (typeof p.costItems)[number]) => {
        const price =
          i.activeOption === "alternative" && i.altUnitPrice != null
            ? i.altUnitPrice
            : i.unitPrice;
        return s + i.quantity * price;
      }, 0);
    return { ...p, finalPrice, fixedItemsCost };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="bg-amber-500 rounded-lg p-1.5">
            <Hammer className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">{user.name}</p>
            <p className="text-xs text-gray-500">Marcenaria</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Client greeting */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, <span className="text-amber-600">{client.name}</span>!
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Aqui está o resumo do seu projeto
          </p>
        </div>

        {publicProjects.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            Nenhum projeto disponível ainda.
          </div>
        ) : (
          publicProjects.map((project: (typeof publicProjects)[number]) => {
            const reviewStatus = project.budgetReview?.status as
              | "pending"
              | "submitted"
              | "confirmed"
              | undefined;
            // Interactive review form only shown while client hasn't submitted yet
            const showReview =
              project.priceVisible && reviewStatus === "pending";
            const hasReviewItems = project.costItems.some(
              (i) => i.requiresReview,
            );
            // Static price hidden only while interactive form is shown
            const showStaticPrice = project.priceVisible && !showReview;

            return (
              <div
                key={project.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Project Header */}
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">
                    {project.name}
                  </h2>
                  {project.description && (
                    <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                    <Calendar className="h-3 w-3" />
                    {new Intl.DateTimeFormat("pt-BR").format(
                      new Date(project.date),
                    )}
                  </div>
                </div>

                {/* Media Gallery */}
                {project.mediaFiles.length > 0 && (
                  <div className="p-4">
                    <PublicGallery files={project.mediaFiles} />
                  </div>
                )}

                {/* Price */}
                <div className="p-6 bg-amber-50 border-t border-amber-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-amber-700 font-medium">
                        Valor do serviço
                      </p>
                      {showStaticPrice ? (
                        <p className="text-3xl font-bold text-amber-900 mt-1">
                          {formatCurrency(project.finalPrice)}
                        </p>
                      ) : !project.priceVisible ? (
                        <p className="text-base font-medium text-amber-700 mt-1 italic">
                          Orçamento em andamento…
                        </p>
                      ) : null}
                    </div>
                    <div className="bg-amber-500 rounded-full p-3">
                      <Hammer className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  {/* Note shown after client submits, waiting for carpenter to confirm */}
                  {reviewStatus === "submitted" && project.priceVisible && (
                    <p className="text-xs text-amber-600 mt-2">
                      Revisão enviada — aguardando confirmação do marceneiro.
                    </p>
                  )}
                </div>

                {/* Budget Review Section */}
                {showReview && hasReviewItems && (
                  <div className="p-6 border-t border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Revisão do orçamento
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                      O marceneiro enviou este orçamento para sua revisão.
                      Confira os itens abaixo.
                    </p>
                    <BudgetReviewForm
                      projectId={project.id}
                      initialStatus={reviewStatus}
                      marginPercent={project.marginPercent}
                      fixedItemsCost={project.fixedItemsCost}
                      items={project.costItems
                        .filter((item) => item.requiresReview)
                        .map((item) => ({
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
                )}
              </div>
            );
          })
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pb-4">
          {user.phone && <p className="mb-1">📞 {user.phone}</p>}
          <p>Orçamento gerado por MarcenariaPro</p>
        </div>
      </main>
    </div>
  );
}
