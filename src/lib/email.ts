import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.RESEND_FROM ?? "MarcenariaPro <noreply@marcenariaproo.com.br>";

export async function sendReviewSubmittedEmail({
  to,
  carpenterName,
  clientName,
  projectName,
  projectUrl,
}: {
  to: string;
  carpenterName: string;
  clientName: string;
  projectName: string;
  projectUrl: string;
}) {
  if (!resend) return;
  await resend.emails.send({
    from: FROM,
    to,
    subject: `${clientName} respondeu a revisão do orçamento — ${projectName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px 16px;color:#1f2937">
        <div style="background:#f59e0b;border-radius:8px;padding:12px 16px;margin-bottom:24px;display:inline-flex;align-items:center;gap:8px">
          <span style="color:#fff;font-weight:700;font-size:16px">MarcenariaPro</span>
        </div>
        <h1 style="font-size:20px;font-weight:700;margin:0 0 8px">Revisão recebida!</h1>
        <p style="color:#6b7280;margin:0 0 24px">
          Olá, ${carpenterName}! O cliente <strong>${clientName}</strong> acabou de responder
          a revisão do orçamento do projeto <strong>${projectName}</strong>.
        </p>
        <a href="${projectUrl}" style="display:inline-block;background:#f59e0b;color:#fff;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:15px">
          Ver revisão do cliente
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:32px">
          Você está recebendo este email porque é um usuário do MarcenariaPro.
        </p>
      </div>
    `,
  });
}

export async function sendReviewConfirmedEmail({
  to,
  clientName,
  carpenterName,
  carpenterPhone,
  projectName,
  projectUrl,
}: {
  to: string;
  clientName: string;
  carpenterName: string;
  carpenterPhone?: string | null;
  projectName: string;
  projectUrl: string;
}) {
  if (!resend) return;
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Orçamento confirmado — ${projectName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px 16px;color:#1f2937">
        <div style="background:#f59e0b;border-radius:8px;padding:12px 16px;margin-bottom:24px">
          <span style="color:#fff;font-weight:700;font-size:16px">MarcenariaPro</span>
        </div>
        <h1 style="font-size:20px;font-weight:700;margin:0 0 8px">Orçamento confirmado!</h1>
        <p style="color:#6b7280;margin:0 0 8px">
          Olá, ${clientName}! O marceneiro <strong>${carpenterName}</strong> confirmou as
          suas escolhas no orçamento do projeto <strong>${projectName}</strong>.
        </p>
        ${carpenterPhone ? `<p style="color:#6b7280;margin:0 0 24px">Para continuar, entre em contato: <strong>${carpenterPhone}</strong></p>` : '<p style="margin:0 0 24px"></p>'}
        <a href="${projectUrl}" style="display:inline-block;background:#f59e0b;color:#fff;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:15px">
          Ver orçamento atualizado
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:32px">
          Orçamento gerado por MarcenariaPro.
        </p>
      </div>
    `,
  });
}
