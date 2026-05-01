import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { ClientDetail } from "@/components/clients/client-detail";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { clientId } = await params;

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      projects: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { costItems: true, mediaFiles: true } },
          costItems: { select: { quantity: true, unitPrice: true } },
        },
      },
    },
  });

  if (!client || client.userId !== session.user.id) notFound();

  const projectsWithTotals = client.projects.map(
    (p: (typeof client.projects)[number]) => {
      const totalCost = p.costItems.reduce(
        (s: number, i: (typeof p.costItems)[number]) =>
          s + i.quantity * i.unitPrice,
        0,
      );
      const finalPrice = totalCost * (1 + p.marginPercent / 100);
      return { ...p, totalCost, finalPrice };
    },
  );

  return <ClientDetail client={{ ...client, projects: projectsWithTotals }} />;
}
