import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>MarcenariaPro</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Header -->
        <tr><td style="background:#f59e0b;border-radius:12px 12px 0 0;padding:28px 40px;text-align:center;">
          <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
            <tr>
              <td style="background:rgba(255,255,255,0.2);border-radius:8px;padding:8px 10px;vertical-align:middle;">
                <span style="font-size:18px;">🔨</span>
              </td>
              <td style="padding-left:10px;vertical-align:middle;">
                <span style="color:#fff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">MarcenariaPro</span>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:40px;border-radius:0 0 12px 12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          ${content}
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 24px;" />
          <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
            Você recebeu este email porque sua conta está registrada no MarcenariaPro.<br/>
            Se não reconhece esta ação, ignore este email.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 0;text-align:center;">
          <p style="margin:0;color:#9ca3af;font-size:11px;">© ${new Date().getFullYear()} MarcenariaPro · Todos os direitos reservados</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  const html = baseTemplate(`
    <h1 style="margin:0 0 8px;color:#111827;font-size:24px;font-weight:700;">Redefinir senha</h1>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
      Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr><td style="background:#f59e0b;border-radius:8px;">
        <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:-0.2px;">
          Redefinir minha senha
        </a>
      </td></tr>
    </table>
    <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">
      Ou copie e cole o link abaixo no seu navegador:
    </p>
    <p style="margin:0 0 24px;padding:12px 16px;background:#f9fafb;border-radius:6px;border:1px solid #e5e7eb;word-break:break-all;">
      <a href="${resetUrl}" style="color:#f59e0b;font-size:13px;text-decoration:none;">${resetUrl}</a>
    </p>
    <p style="margin:0;color:#9ca3af;font-size:13px;">
      ⏱ Este link expira em <strong>1 hora</strong>.
    </p>
  `);

  return resend.emails.send({
    from: "MarcenariaPro <noreply@marcenariapro.com.br>",
    to: email,
    subject: "Redefinir sua senha — MarcenariaPro",
    html,
  });
}
