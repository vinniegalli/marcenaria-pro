import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FolderOpen, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { PeriodFilter } from "@/components/dashboard/period-filter";
import { Suspense } from "react";

function getPeriodRange(periodo: string): { gte: Date; lte: Date } | null {
  const now = new Date();
  if (periodo === "mes") {
    return {
      gte: new Date(now.getFullYear(), now.getMonth(), 1),
      lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59),
    };
  }
  if (periodo === "ano") {
    return {
      gte: new Date(now.getFullYear(), 0, 1),
      lte: new Date(now.getFullYear(), 11, 31, 23, 59, 59),
    };
  }
  return null;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;
  const { periodo = "mes" } = await searchParams;

  const range = getPeriodRange(periodo);
  const dateFilter = range ? { gte: range.gte, lte: range.lte } : undefined;

  const [totalClients, totalProjects, periodProjects, recentProjects] =
    await Promise.all([
      prisma.client.count({ where: { userId } }),
      prisma.project.count({ where: { userId } }),
      prisma.project.findMany({
        where: {
          userId,
          ...(dateFilter ? { createdAt: dateFilter } : {}),
        },
        include: { costItems: { select: { quantity: true, unitPrice: true } } },
      }),
      prisma.project.findMany({
        where: { userId },
        include: { client: { select: { name: true, id: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const { totalCost, totalRevenue } = periodProjects.reduce(
    (
      acc: { totalCost: number; totalRevenue: number },
      p: (typeof periodProjects)[number],
    ) => {
      const cost = p.costItems.reduce(
        (s: number, i: (typeof p.costItems)[number]) =>
          s + i.quantity * i.unitPrice,
        0,
      );
      const revenue = cost * (1 + p.marginPercent / 100);
      return {
        totalCost: acc.totalCost + cost,
        totalRevenue: acc.totalRevenue + revenue,
      };
    },
    { totalCost: 0, totalRevenue: 0 },
  );

  const lucro = totalRevenue - totalCost;

  const stats = [
    {
      label: "Clientes",
      value: totalClients,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: periodo === "tudo" ? "Total de projetos" : "Projetos no período",
      value: periodProjects.length,
      icon: FolderOpen,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: periodo === "tudo" ? "Lucro total" : "Lucro no período",
      value: formatCurrency(lucro),
      icon: TrendingUp,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, {session?.user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Aqui está um resumo dos seus projetos
          </p>
        </div>
        <Suspense>
          <PeriodFilter current={periodo} />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {value}
                  </p>
                </div>
                <div className={`${bg} rounded-xl p-3`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Clock className="h-5 w-5 text-gray-400" />
          <CardTitle className="text-base">Projetos recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentProjects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Nenhum projeto ainda.</p>
              <Link
                href="/dashboard/clients"
                className="text-amber-600 hover:underline text-sm mt-1 inline-block"
              >
                Crie um cliente para começar
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentProjects.map(
                (project: (typeof recentProjects)[number]) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/clients/${project.client.id}/projects/${project.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {project.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {project.client.name}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatDate(project.createdAt)}
                    </span>
                  </Link>
                ),
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
