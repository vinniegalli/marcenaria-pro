import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Sincronizar usuário do Supabase com o Prisma
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const name: string =
          user.user_metadata?.name ?? user.email?.split("@")[0] ?? "Usuário";
        const phone: string | null = user.user_metadata?.phone ?? null;

        const existing = await prisma.user.findUnique({
          where: { id: user.id },
        });

        if (!existing) {
          let baseUsername = slugify(name) || "user";
          let username = baseUsername;
          let counter = 1;

          while (await prisma.user.findUnique({ where: { username } })) {
            username = `${baseUsername}${counter++}`;
          }

          await prisma.user.create({
            data: {
              id: user.id,
              name,
              email: user.email!,
              username,
              phone,
            },
          });
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=callback`);
}
