import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const name: string =
    user.user_metadata?.name ?? user.email?.split("@")[0] ?? "Usuário";
  const phone: string | null = user.user_metadata?.phone ?? null;

  // Gera username único baseado no nome
  let baseUsername = slugify(name) || "user";
  let username = baseUsername;
  let counter = 1;

  while (await prisma.user.findUnique({ where: { username } })) {
    username = `${baseUsername}${counter++}`;
  }

  const dbUser = await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      name,
      email: user.email!,
      username,
      phone,
    },
  });

  return NextResponse.json(dbUser, { status: 201 });
}
