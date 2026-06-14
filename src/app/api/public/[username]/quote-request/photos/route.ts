import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase";

const QUOTE_PHOTOS_BUCKET = "quote-photos";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type Params = { params: Promise<{ username: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { username } = await params;

  const carpenter = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!carpenter) {
    return NextResponse.json({ error: "Marceneiro não encontrado" }, { status: 404 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const quoteRequestId = formData.get("quoteRequestId") as string | null;

    if (!file || !quoteRequestId) {
      return NextResponse.json({ error: "Arquivo ou ID ausente" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Apenas imagens JPG, PNG ou WEBP" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Arquivo muito grande (máximo 10MB)" }, { status: 400 });
    }

    // Verify the quote request belongs to this carpenter
    const quoteRequest = await prisma.quoteRequest.findFirst({
      where: { id: quoteRequestId, carpenterId: carpenter.id },
      select: { id: true, _count: { select: { photos: true } } },
    });

    if (!quoteRequest) {
      return NextResponse.json({ error: "Solicitação não encontrada" }, { status: 404 });
    }

    if (quoteRequest._count.photos >= 3) {
      return NextResponse.json({ error: "Máximo de 3 fotos por solicitação" }, { status: 400 });
    }

    const ext = file.name.split(".").pop();
    const storagePath = `${quoteRequestId}/${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from(QUOTE_PHOTOS_BUCKET)
      .upload(storagePath, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      return NextResponse.json({ error: "Falha no upload" }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(QUOTE_PHOTOS_BUCKET)
      .getPublicUrl(storagePath);

    const photo = await prisma.quoteRequestPhoto.create({
      data: { quoteRequestId, url: urlData.publicUrl, storagePath },
    });

    return NextResponse.json(photo, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
