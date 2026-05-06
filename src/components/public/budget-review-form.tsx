"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface CostItemPublic {
  id: string;
  name: string;
  category?: string | null;
  quantity: number;
  unitPrice: number;
  altName?: string | null;
  altUnitPrice?: number | null;
  activeOption?: string;
}

type ItemDecision =
  | { type: "approved" }
  | { type: "alternative" }
  | { type: "contested"; comment: string }
  | null;

interface BudgetReviewFormProps {
  projectId: string;
  items: CostItemPublic[];
  username: string;
  clientSlug: string;
  marginPercent: number;
  initialStatus?: "pending" | "submitted";
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function getEffectivePrice(
  item: CostItemPublic,
  decision: ItemDecision,
): number {
  if (decision?.type === "alternative" && item.altUnitPrice != null) {
    return item.altUnitPrice;
  }
  return item.unitPrice;
}

export function BudgetReviewForm({
  projectId,
  items,
  username,
  clientSlug,
  marginPercent,
  initialStatus,
}: BudgetReviewFormProps) {
  const [submitted, setSubmitted] = useState(initialStatus === "submitted");
  const [loading, setLoading] = useState(false);
  const [decisions, setDecisions] = useState<Record<string, ItemDecision>>(() =>
    Object.fromEntries(items.map((item) => [item.id, null])),
  );
  const [contestComments, setContestComments] = useState<
    Record<string, string>
  >(() => Object.fromEntries(items.map((item) => [item.id, ""])));

  function decide(id: string, type: "approved" | "alternative" | "contested") {
    setDecisions((prev) => ({
      ...prev,
      [id]:
        type === "contested"
          ? { type: "contested", comment: contestComments[id] ?? "" }
          : { type },
    }));
  }

  function setComment(id: string, comment: string) {
    setContestComments((prev) => ({ ...prev, [id]: comment }));
    setDecisions((prev) => {
      const d = prev[id];
      if (d?.type === "contested")
        return { ...prev, [id]: { type: "contested", comment } };
      return prev;
    });
  }

  // Estimated price: sum of effective prices * (1 + margin/100)
  const estimatedPrice =
    items.reduce((sum, item) => {
      const d = decisions[item.id];
      const price = getEffectivePrice(item, d);
      return sum + item.quantity * price;
    }, 0) *
    (1 + marginPercent / 100);

  const answeredCount = Object.values(decisions).filter(
    (d) => d !== null,
  ).length;

  async function handleSubmit() {
    const unanswered = items.filter((i) => decisions[i.id] === null);
    if (unanswered.length > 0) {
      toast.error(
        `Responda todos os itens antes de enviar (${unanswered.length} pendente${unanswered.length > 1 ? "s" : ""})`,
      );
      return;
    }

    setLoading(true);
    try {
      const payload = {
        projectId,
        items: items.map((item) => {
          const d = decisions[item.id];
          const hasAlt = !!item.altName;
          let itemStatus: "approved" | "contested" | "alternative";
          let selectedOption: "primary" | "alternative" = "primary";

          if (d?.type === "alternative" && hasAlt) {
            itemStatus = "alternative";
            selectedOption = "alternative";
          } else if (d?.type === "contested") {
            itemStatus = "contested";
            selectedOption = "primary";
          } else {
            itemStatus = "approved";
            selectedOption = "primary";
          }

          return {
            costItemId: item.id,
            itemStatus,
            selectedOption,
            comment:
              d?.type === "contested" ? d.comment || undefined : undefined,
          };
        }),
      };

      const res = await fetch(`/api/public/${username}/${clientSlug}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error);
      }

      setSubmitted(true);
      toast.success("Revisão enviada com sucesso!");
    } catch (err) {
      toast.error((err as Error).message ?? "Erro ao enviar revisão");
    } finally {
      setLoading(false);
    }
  }

  function handleReview() {
    setSubmitted(false);
    setDecisions(Object.fromEntries(items.map((item) => [item.id, null])));
    setContestComments(Object.fromEntries(items.map((item) => [item.id, ""])));
  }

  if (submitted) {
    return (
      <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-5 text-center">
        <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
        <p className="font-semibold text-green-800">Revisão enviada!</p>
        <p className="text-sm text-green-700 mt-1">
          O marceneiro foi notificado e irá analisar seu feedback.
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 text-green-700 hover:text-green-900"
          onClick={handleReview}
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          Revisar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {/* Live price estimate */}
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-amber-700">Valor estimado</p>
          <p className="text-xs text-amber-600 mt-0.5">
            Atualiza conforme suas escolhas
          </p>
        </div>
        <p className="text-2xl font-bold text-amber-900">
          {formatCurrency(estimatedPrice)}
        </p>
      </div>

      <p className="text-sm text-gray-600 font-medium">
        Revise cada item e escolha sua preferência:
      </p>

      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
        {items.map((item) => {
          const d = decisions[item.id];
          const hasAlt = !!item.altName;

          return (
            <div key={item.id} className="bg-white px-4 py-3 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900 text-sm">
                      {item.name}
                    </span>
                    {item.category && (
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Qtd: {item.quantity}
                  </p>
                </div>
              </div>

              {hasAlt ? (
                /* Item with alternative option */
                <div className="space-y-1.5">
                  <p className="text-xs text-gray-500 font-medium">
                    Escolha uma opção:
                  </p>
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => decide(item.id, "approved")}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors border text-left ${
                        d?.type === "approved"
                          ? "bg-green-500 text-white border-green-500"
                          : "border-gray-200 text-gray-700 hover:border-green-400 hover:bg-green-50"
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span className="font-medium">{item.name}</span>
                    </button>
                    <button
                      onClick={() => decide(item.id, "alternative")}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors border text-left ${
                        d?.type === "alternative"
                          ? "bg-amber-500 text-white border-amber-500"
                          : "border-gray-200 text-gray-700 hover:border-amber-400 hover:bg-amber-50"
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span className="font-medium">{item.altName}</span>
                    </button>
                    <button
                      onClick={() => decide(item.id, "contested")}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors border text-left ${
                        d?.type === "contested"
                          ? "bg-red-500 text-white border-red-500"
                          : "border-gray-200 text-gray-600 hover:border-red-400 hover:bg-red-50"
                      }`}
                    >
                      <XCircle className="h-4 w-4 shrink-0" />
                      <span>Contestar / Outra sugestão</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Item without alternative */
                <div className="flex gap-1.5">
                  <button
                    onClick={() => decide(item.id, "approved")}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors border ${
                      d?.type === "approved"
                        ? "bg-green-500 text-white border-green-500"
                        : "border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600"
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Aprovar
                  </button>
                  <button
                    onClick={() => decide(item.id, "contested")}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors border ${
                      d?.type === "contested"
                        ? "bg-red-500 text-white border-red-500"
                        : "border-gray-200 text-gray-600 hover:border-red-400 hover:text-red-600"
                    }`}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Contestar
                  </button>
                </div>
              )}

              {d?.type === "contested" && (
                <Textarea
                  placeholder="Explique o motivo ou sugira uma alternativa..."
                  rows={2}
                  className="text-sm resize-none mt-1"
                  value={contestComments[item.id]}
                  onChange={(e) => setComment(item.id, e.target.value)}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-gray-500">
          {answeredCount} de {items.length} itens respondidos
        </p>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-amber-500 hover:bg-amber-600"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enviar revisão
        </Button>
      </div>
    </div>
  );
}
