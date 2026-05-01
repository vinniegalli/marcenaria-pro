import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations";
import { generateToken } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to avoid email enumeration
    if (!user) {
      return NextResponse.json({
        message: "Se o email existir, você receberá as instruções em breve",
      });
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    // TODO: Send email with reset link
    // await sendResetEmail(user.email, token)
    // For development, log the token
    if (process.env.NODE_ENV === "development") {
      console.log(`Reset token for ${email}: ${token}`);
      console.log(
        `Reset URL: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
      );
    }

    return NextResponse.json({
      message: "Se o email existir, você receberá as instruções em breve",
    });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
