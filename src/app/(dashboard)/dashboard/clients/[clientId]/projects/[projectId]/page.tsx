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
    },
  });

  if (!project || project.userId !== userId || project.clientId !== clientId) {
    notFound();
  }

  const totalCost = project.costItems.reduce(
    (s: number, i: (typeof project.costItems)[number]) =>
      s + i.quantity * i.unitPrice,
    0,
  );
  const finalPrice = totalCost * (1 + project.marginPercent / 100);
  const costItemsWithTotal = project.costItems.map(
    (i: (typeof project.costItems)[number]) => ({
      ...i,
      total: i.quantity * i.unitPrice,
    }),
  );

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true },
  });
  const username = dbUser?.username ?? "";

  return (
    <ProjectDetail
      project={{
        ...project,
        costItems: costItemsWithTotal,
        mediaFiles: project.mediaFiles,
        totalCost,
        finalPrice,
        date: project.date.toISOString(),
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
      }}
      username={username}
    />
  );
}
