import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Hammer, CheckCircle2, Clock, MessageCircle, Phone, Mail } from "lucide-react";

export default async function SolicitacaoPublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const request = await prisma.quoteRequest.findUnique({
    where: { id },
    include: {
      carpenter: {
        select: {
          name: true,
          email: true,
          phone: true,
          username: true,
          publicProfile: { select: { whatsapp: true } },
        },
      },
    },
  });

  if (!request) notFound();

  const carpenter = request.carpenter;
  const whatsapp = carpenter.publicProfile?.whatsapp ?? carpenter.phone;
  const responded = request.status === "responded";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="bg-amber-500 rounded-lg p-1.5">
            <Hammer className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-sm text-gray-900">Projetta</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">Solicitação de pré-orçamento</p>
          <h1 className="text-2xl font-bold text-gray-900">
            {responded ? "Pré-orçamento recebido!" : "Aguardando resposta"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Enviada para <strong>{carpenter.name}</strong>
          </p>
        </div>

        {/* Status */}
        <div
          className={`rounded-xl p-5 flex items-start gap-4 ${
            responded
              ? "bg-green-50 border border-green-200"
              : "bg-amber-50 border border-amber-200"
          }`}
        >
          {responded ? (
            <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
          ) : (
            <Clock className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-semibold text-gray-900">
              {responded
                ? "O marceneiro respondeu sua solicitação"
                : "Sua solicitação foi enviada com sucesso"}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {responded
                ? "Veja abaixo o pré-orçamento e entre em contato para fechar o projeto."
                : "Assim que o marceneiro responder, você poderá ver o pré-orçamento aqui nesta página."}
            </p>
          </div>
        </div>

        {/* Response details */}
        {responded && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-gray-900">Pré-orçamento</h2>

            {(request.priceMin || request.priceMax) && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-xs text-amber-700 mb-1 font-medium">Estimativa de valor</p>
                <p className="text-2xl font-bold text-amber-800">
                  {request.priceMin && request.priceMax
                    ? `R$ ${request.priceMin.toLocaleString("pt-BR")} – R$ ${request.priceMax.toLocaleString("pt-BR")}`
                    : request.priceMin
                      ? `A partir de R$ ${request.priceMin.toLocaleString("pt-BR")}`
                      : `Até R$ ${request.priceMax!.toLocaleString("pt-BR")}`}
                </p>
                {request.validDays && (
                  <p className="text-xs text-amber-600 mt-1">
                    Válido por {request.validDays} dias
                  </p>
                )}
              </div>
            )}

            {request.responseNote && (
              <div>
                <p className="text-xs text-gray-500 mb-1 font-medium">
                  Observações do marceneiro
                </p>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg">
                  {request.responseNote}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Carpenter contact */}
        {responded && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4">
              Falar com {carpenter.name}
            </h2>
            <div className="space-y-3">
              {whatsapp && (
                <a
                  href={`https://wa.me/55${whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white rounded-xl px-4 py-3 transition-colors font-medium text-sm"
                >
                  <MessageCircle className="h-5 w-5" />
                  Chamar no WhatsApp
                </a>
              )}
              {carpenter.phone && carpenter.phone !== whatsapp && (
                <a
                  href={`tel:${carpenter.phone.replace(/\D/g, "")}`}
                  className="flex items-center gap-3 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl px-4 py-3 transition-colors text-sm"
                >
                  <Phone className="h-5 w-5 text-gray-400" />
                  {carpenter.phone}
                </a>
              )}
              <a
                href={`mailto:${carpenter.email}`}
                className="flex items-center gap-3 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl px-4 py-3 transition-colors text-sm"
              >
                <Mail className="h-5 w-5 text-gray-400" />
                {carpenter.email}
              </a>
            </div>
          </div>
        )}

        <div className="text-center text-xs text-gray-400 py-4">
          Serviço oferecido por{" "}
          <Link href="/" className="hover:underline">
            Projetta
          </Link>
        </div>
      </main>
    </div>
  );
}
