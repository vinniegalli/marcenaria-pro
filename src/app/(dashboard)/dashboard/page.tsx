import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FolderOpen, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const [totalClients, totalProjects, projects, recentProjects] =
    await Promise.all([
      prisma.client.count({ where: { userId } }),
      prisma.project.count({ where: { userId } }),
      prisma.project.findMany({
        where: { userId },
        include: { costItems: { select: { quantity: true, unitPrice: true } } },
      }),
      prisma.project.findMany({
        where: { userId },
        include: { client: { select: { name: true, id: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const estimatedRevenue = projects.reduce(
    (sum: number, p: (typeof projects)[number]) => {
      const cost = p.costItems.reduce(
        (s: number, i: (typeof p.costItems)[number]) =>
          s + i.quantity * i.unitPrice,
        0,
      );
      return sum + cost * (1 + p.marginPercent / 100);
    },
    0,
  );

  const stats = [
    {
      label: "Clientes",
      value: totalClients,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Projetos",
      value: totalProjects,
      icon: FolderOpen,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Faturamento estimado",
      value: formatCurrency(estimatedRevenue),
      icon: TrendingUp,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Olá, {session?.user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Aqui está um resumo dos seus projetos
        </p>
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
