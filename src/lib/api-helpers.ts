import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
