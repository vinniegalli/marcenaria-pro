import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin, STORAGE_BUCKET } from "@/lib/supabase";
import {
  getAuthSession,
  unauthorized,
  notFound,
  forbidden,
} from "@/lib/api-helpers";

type Params = { params: Promise<{ mediaId: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  const { mediaId } = await params;

  const media = await prisma.mediaFile.findUnique({
    where: { id: mediaId },
    include: { project: { select: { userId: true } } },
  });

  if (!media) return notFound("Arquivo não encontrado");
  if (media.project.userId !== session.user.id) return forbidden();

  // Delete from Supabase Storage
  await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([media.storagePath]);

  await prisma.mediaFile.delete({ where: { id: mediaId } });

  return NextResponse.json({ message: "Arquivo excluído" });
}
