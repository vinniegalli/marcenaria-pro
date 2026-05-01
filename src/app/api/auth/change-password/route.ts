import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { changePasswordSchema } from "@/lib/validations";
import { getAuthSession, unauthorized } from "@/lib/api-helpers";

export async function PATCH(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  try {
    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    // Verifica senha atual via signInWithPassword
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user?.email) return unauthorized();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userData.user.email,
      password: currentPassword,
    });

    if (signInError) {
      return NextResponse.json(
        { error: "Senha atual incorreta" },
        { status: 400 },
      );
    }

    // Atualiza a senha via admin (service role)
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      session.user.id,
      { password: newPassword },
    );

    if (updateError) {
      return NextResponse.json(
        { error: "Erro ao alterar senha" },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "Senha alterada com sucesso" });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
