import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/api-helpers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { MessageSquare, Clock, CheckCircle2 } from "lucide-react";

const LOCATION_LABELS: Record<string, string> = {
  cozinha: "Cozinha", banheiro: "Banheiro", sala: "Sala",
  quarto: "Quarto", escritorio: "Escritório", varanda: "Varanda", outro: "Outro",
};

const DEADLINE_LABELS: Record<string, string> = {
  urgente: "Urgente", "1_mes": "1 mês", "2_3_meses": "2-3 meses", sem_pressa: "Sem pressa",
};

export default async function QuoteRequestsPage() {
  const session = await getAuthSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });

  if (user?.plan !== "pro") redirect("/pricing");

  const requests = await prisma.quoteRequest.findMany({
    where: { carpenterId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { photos: { select: { url: true }, take: 1 } },
  });

  const pending = requests.filter((r) => r.status === "pending");
  const responded = requests.filter((r) => r.status === "responded");

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Solicitações</h1>
          <p className="text-gray-500 text-sm mt-1">Pré-orçamentos solicitados pelos clientes</p>
        </div>
        {pending.length > 0 && (
          <Badge className="bg-amber-500 text-white">{pending.length} pendente{pending.length > 1 ? "s" : ""}</Badge>
        )}
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Nenhuma solicitação ainda</p>
          <p className="text-sm mt-1">Compartilhe seu perfil público para receber solicitações</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Link
              key={req.id}
              href={`/dashboard/quote-requests/${req.id}`}
              className="block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4"
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${req.status === "pending" ? "bg-amber-500" : "bg-green-500"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900">{req.clientName}</p>
                    <Badge variant="outline" className="text-xs">
                      {LOCATION_LABELS[req.location] ?? req.location}
                    </Badge>
                    <Badge variant="outline" className="text-xs text-gray-500">
                      {DEADLINE_LABELS[req.deadline] ?? req.deadline}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{req.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    {req.status === "pending" ? (
                      <span className="flex items-center gap-1 text-amber-600">
                        <Clock className="h-3 w-3" /> Aguardando resposta
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-3 w-3" /> Respondido
                      </span>
                    )}
                    <span>{formatDate(req.createdAt.toISOString())}</span>
                  </div>
                </div>
                {req.photos[0] && (
                  <img
                    src={req.photos[0].url}
                    alt="referência"
                    className="w-14 h-14 rounded-lg object-cover shrink-0"
                  />
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
