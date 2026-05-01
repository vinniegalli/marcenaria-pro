import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export type AuthSession = {
  user: { id: string };
};

export async function getAuthSession(): Promise<AuthSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  // Garante que o User existe no Prisma (sincroniza contas criadas antes da migração)
  const existingById = await prisma.user.findUnique({ where: { id: user.id } });

  if (!existingById) {
    const name: string =
      user.user_metadata?.name ?? user.email?.split("@")[0] ?? "Usuário";
    const phone: string | null = user.user_metadata?.phone ?? null;

    // Usuário pode existir com email correto mas ID antigo (ex: migração do NextAuth)
    const existingByEmail = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (existingByEmail) {
      // Atualiza o ID para o UUID do Supabase
      await prisma.user.update({
        where: { email: user.email! },
        data: { id: user.id },
      });
    } else {
      let baseUsername = slugify(name) || "user";
      let username = baseUsername;
      let counter = 1;
      while (await prisma.user.findUnique({ where: { username } })) {
        username = `${baseUsername}${counter++}`;
      }

      await prisma.user.create({
        data: { id: user.id, name, email: user.email!, username, phone },
      });
    }
  }

  return { user: { id: user.id } };
}

export function unauthorized() {
  return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
}

export function notFound(msg = "Não encontrado") {
  return NextResponse.json({ error: msg }, { status: 404 });
}

export function badRequest(msg: string) {
  return NextResponse.json({ error: msg }, { status: 400 });
}

export function forbidden() {
  return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
}
