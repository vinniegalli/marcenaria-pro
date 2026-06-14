import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Users, FolderOpen, TrendingUp, ArrowUpRight } from "lucide-react";
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

const STATUS_LABEL: Record<string, string> = {
  orcamento: "Orçamento",
  aprovado: "Aprovado",
  em_producao: "Em produção",
  entregue: "Entregue",
};

const STATUS_STYLE: Record<string, { color: string; bg: string; dot: string }> = {
  orcamento: { color: "#9C8A70", bg: "rgba(156,138,112,0.1)", dot: "#9C8A70" },
  aprovado: { color: "#2C5F3F", bg: "rgba(44,95,63,0.1)", dot: "#2C5F3F" },
  em_producao: { color: "#C08B2A", bg: "rgba(192,139,42,0.1)", dot: "#C08B2A" },
  entregue: { color: "#1A1208", bg: "rgba(26,18,8,0.07)", dot: "#1A1208" },
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user!.id;
  const { periodo = "mes" } = await searchParams;

  const range = getPeriodRange(periodo);
  const dateFilter = range ? { gte: range.gte, lte: range.lte } : undefined;

  const [totalClients, periodProjects, recentProjects] = await Promise.all([
    prisma.client.count({ where: { userId } }),
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
      take: 6,
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
  const firstName = (user?.user_metadata?.name as string | undefined)?.split(" ")[0];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: "#9C8A70" }}>
            Bem-vindo de volta
          </p>
          <h1
            className="text-3xl md:text-4xl"
            style={{
              fontFamily: "var(--font-fraunces), serif",
              color: "#1A1208",
              fontStyle: "italic",
            }}
          >
            {firstName ? `Olá, ${firstName}.` : "Olá."}
          </h1>
        </div>
        <Suspense>
          <PeriodFilter current={periodo} />
        </Suspense>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Clientes */}
        <div
          className="rounded-2xl p-6"
          style={{ background: "white", border: "1px solid #E8DCC8" }}
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(44,95,63,0.1)" }}
            >
              <Users className="h-5 w-5" style={{ color: "#2C5F3F" }} />
            </div>
            <Link
              href="/dashboard/clients"
              className="text-xs font-medium flex items-center gap-1 transition-opacity hover:opacity-70"
              style={{ color: "#9C8A70" }}
            >
              Ver todos
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <p
            className="text-4xl font-bold mb-1"
            style={{
              fontFamily: "var(--font-fraunces), serif",
              color: "#1A1208",
            }}
          >
            {totalClients}
          </p>
          <p className="text-sm" style={{ color: "#9C8A70" }}>
            Clientes cadastrados
          </p>
        </div>

        {/* Projetos no período */}
        <div
          className="rounded-2xl p-6"
          style={{ background: "white", border: "1px solid #E8DCC8" }}
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(192,139,42,0.1)" }}
            >
              <FolderOpen className="h-5 w-5" style={{ color: "#C08B2A" }} />
            </div>
          </div>
          <p
            className="text-4xl font-bold mb-1"
            style={{
              fontFamily: "var(--font-fraunces), serif",
              color: "#1A1208",
            }}
          >
            {periodProjects.length}
          </p>
          <p className="text-sm" style={{ color: "#9C8A70" }}>
            {periodo === "tudo" ? "Total de projetos" : "Projetos no período"}
          </p>
        </div>

        {/* Lucro */}
        <div
          className="rounded-2xl p-6"
          style={{ background: "#1A1208", border: "1px solid rgba(192,139,42,0.15)" }}
        >
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(192,139,42,0.15)" }}
            >
              <TrendingUp className="h-5 w-5" style={{ color: "#C08B2A" }} />
            </div>
          </div>
          <p
            className="text-4xl font-bold mb-1"
            style={{
              fontFamily: "var(--font-fraunces), serif",
              color: "#FAF7F2",
            }}
          >
            {formatCurrency(lucro)}
          </p>
          <p className="text-sm" style={{ color: "#9C8A70" }}>
            {periodo === "tudo" ? "Lucro total" : "Lucro no período"}
          </p>
          {totalRevenue > 0 && (
            <p className="text-xs mt-2" style={{ color: "#9C8A70" }}>
              Faturamento:{" "}
              <span style={{ color: "#C08B2A" }}>{formatCurrency(totalRevenue)}</span>
            </p>
          )}
        </div>
      </div>

      {/* Projetos recentes */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "white", border: "1px solid #E8DCC8" }}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid #E8DCC8" }}
        >
          <h2 className="font-semibold text-base" style={{ color: "#1A1208" }}>
            Projetos recentes
          </h2>
          <Link
            href="/dashboard/clients"
            className="text-xs font-medium flex items-center gap-1 transition-opacity hover:opacity-70"
            style={{ color: "#9C8A70" }}
          >
            Ver todos
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm mb-2" style={{ color: "#9C8A70" }}>
              Nenhum projeto ainda.
            </p>
            <Link
              href="/dashboard/clients"
              className="text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: "#C08B2A" }}
            >
              Crie um cliente para começar →
            </Link>
          </div>
        ) : (
          <div>
            {recentProjects.map(
              (project: (typeof recentProjects)[number], i: number) => {
                const statusKey = (project as { workStatus?: string }).workStatus ?? "orcamento";
                const style = STATUS_STYLE[statusKey] ?? STATUS_STYLE["orcamento"];
                return (
                  <Link
                    key={project.id}
                    href={`/dashboard/clients/${project.client.id}/projects/${project.id}`}
                    className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-[#FAF7F2] group"
                    style={{
                      borderBottom:
                        i < recentProjects.length - 1
                          ? "1px solid #F5F0E8"
                          : "none",
                    }}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                        style={{ background: "#F5F0E8", color: "#9C8A70" }}
                      >
                        {project.name[0]?.toUpperCase() ?? "P"}
                      </div>
                      <div className="min-w-0">
                        <p
                          className="font-medium text-sm truncate group-hover:text-[#C08B2A] transition-colors"
                          style={{ color: "#1A1208" }}
                        >
                          {project.name}
                        </p>
                        <p className="text-xs truncate" style={{ color: "#9C8A70" }}>
                          {project.client.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span
                        className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ background: style.bg, color: style.color }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: style.dot }}
                        />
                        {STATUS_LABEL[statusKey] ?? "Orçamento"}
                      </span>
                      <span className="text-xs" style={{ color: "#9C8A70" }}>
                        {formatDate(project.createdAt)}
                      </span>
                    </div>
                  </Link>
                );
              },
            )}
          </div>
        )}
      </div>
    </div>
  );
}
