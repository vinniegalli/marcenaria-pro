import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/api-helpers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { QuoteRespondForm } from "@/components/quote-requests/quote-respond-form";

const LOCATION_LABELS: Record<string, string> = {
  cozinha: "Cozinha", banheiro: "Banheiro", sala: "Sala",
  quarto: "Quarto", escritorio: "Escritório", varanda: "Varanda", outro: "Outro",
};

const DEADLINE_LABELS: Record<string, string> = {
  urgente: "Urgente (até 1 semana)", "1_mes": "Em até 1 mês",
  "2_3_meses": "2 a 3 meses", sem_pressa: "Sem pressa",
};

export default async function QuoteRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAuthSession();
  if (!session) redirect("/login");

  const { id } = await params;

  const [user, request] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, select: { plan: true } }),
    prisma.quoteRequest.findFirst({
      where: { id, carpenterId: session.user.id },
      include: { photos: true },
    }),
  ]);

  if (user?.plan !== "pro") redirect("/pricing");
  if (!request) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/quote-requests"
          className="inline-flex items-center justify-center rounded-lg size-8 hover:bg-muted text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Solicitação de {request.clientName}</h1>
          <p className="text-xs text-gray-400">{formatDate(request.createdAt.toISOString())}</p>
        </div>
      </div>

      {/* Dados do cliente */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
        <h2 className="font-semibold text-gray-900">Dados do cliente</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500">Nome:</span> <span className="font-medium">{request.clientName}</span></div>
          <div><span className="text-gray-500">Email:</span> <a href={`mailto:${request.clientEmail}`} className="font-medium text-amber-600 hover:underline">{request.clientEmail}</a></div>
          {request.clientPhone && (
            <div><span className="text-gray-500">Telefone:</span> <a href={`https://wa.me/55${request.clientPhone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="font-medium text-green-600 hover:underline">{request.clientPhone}</a></div>
          )}
        </div>
      </div>

      {/* Detalhes do projeto */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
        <h2 className="font-semibold text-gray-900">Detalhes do projeto</h2>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline">{LOCATION_LABELS[request.location] ?? request.location}</Badge>
          <Badge variant="outline">{DEADLINE_LABELS[request.deadline] ?? request.deadline}</Badge>
        </div>
        {request.dimensions && (
          <p className="text-sm"><span className="text-gray-500">Medidas: </span>{request.dimensions}</p>
        )}
        <p className="text-sm text-gray-700 leading-relaxed">{request.description}</p>

        {request.photos.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-2">Fotos de referência</p>
            <div className="flex gap-2 flex-wrap">
              {request.photos.map((photo) => (
                <a key={photo.id} href={photo.url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={photo.url}
                    alt="referência"
                    className="w-24 h-24 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity"
                  />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resposta */}
      <QuoteRespondForm
        requestId={request.id}
        initialStatus={request.status}
        initialData={{
          priceMin: request.priceMin ? String(request.priceMin) : "",
          priceMax: request.priceMax ? String(request.priceMax) : "",
          responseNote: request.responseNote ?? "",
          validDays: request.validDays ? String(request.validDays) : "15",
        }}
        respondedAt={request.respondedAt?.toISOString() ?? null}
      />
    </div>
  );
}
