import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Hammer, ArrowLeft } from "lucide-react";
import { QuoteRequestForm } from "@/components/public/quote-request-form";

export default async function QuoteRequestPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, name: true, plan: true },
  });

  if (!user) notFound();

  if (user.plan !== "pro") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500">Este marceneiro não está recebendo solicitações no momento.</p>
          <Link href={`/${username}`} className="text-amber-600 hover:underline text-sm mt-2 inline-block">
            Voltar ao perfil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="bg-amber-500 rounded-lg p-1.5">
            <Hammer className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-sm text-gray-900">MarcenariaPro</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href={`/${username}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar ao perfil
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Solicitar pré-orçamento</h1>
          <p className="text-gray-500 text-sm mt-1">
            Preencha as informações abaixo e <strong>{user.name}</strong> entrará em contato com um pré-orçamento.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <QuoteRequestForm username={username} />
        </div>

        <div className="text-center text-xs text-gray-400 py-6">
          <p>Serviço oferecido por MarcenariaPro</p>
        </div>
      </main>
    </div>
  );
}
