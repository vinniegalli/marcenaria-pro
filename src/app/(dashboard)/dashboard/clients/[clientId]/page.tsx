import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { ClientDetail } from "@/components/clients/client-detail";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const userId = user.id;

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

  if (!client || client.userId !== userId) notFound();

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
