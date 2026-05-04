"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface CostItemPublic {
  id: string;
  name: string;
  category?: string | null;
  quantity: number;
  unitPrice: number;
  marginPercent: number;
}

interface ItemState {
  status: "approved" | "contested" | null;
  comment: string;
  commentOpen: boolean;
}

interface BudgetReviewFormProps {
  projectId: string;
  items: CostItemPublic[];
  username: string;
  clientSlug: string;
  initialStatus?: "pending" | "submitted";
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function BudgetReviewForm({
  projectId,
  items,
  username,
  clientSlug,
  initialStatus,
}: BudgetReviewFormProps) {
  const [submitted, setSubmitted] = useState(initialStatus === "submitted");
  const [loading, setLoading] = useState(false);

  const [itemStates, setItemStates] = useState<Record<string, ItemState>>(() =>
    Object.fromEntries(
      items.map((item) => [
        item.id,
        { status: null, comment: "", commentOpen: false },
      ]),
    ),
  );

  function setStatus(id: string, status: "approved" | "contested") {
    setItemStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        status,
        commentOpen: status === "contested",
      },
    }));
  }

  function setComment(id: string, comment: string) {
    setItemStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], comment },
    }));
  }

  async function handleSubmit() {
    const unanswered = items.filter((i) => itemStates[i.id]?.status === null);
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
        items: items.map((item) => ({
          costItemId: item.id,
          itemStatus: itemStates[item.id].status,
          comment: itemStates[item.id].comment || undefined,
        })),
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
    setItemStates(
      Object.fromEntries(
        items.map((item) => [
          item.id,
          { status: null, comment: "", commentOpen: false },
        ]),
      ),
    );
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
      <p className="text-sm text-gray-600 font-medium">
        Revise cada item e aprove ou conteste conforme necessário:
      </p>

      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
        {items.map((item) => {
          const state = itemStates[item.id];
          const itemTotal =
            item.quantity * item.unitPrice * (1 + item.marginPercent / 100);

          return (
            <div key={item.id} className="bg-white px-4 py-3">
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
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.quantity} un. ×{" "}
                    {formatCurrency(
                      item.unitPrice * (1 + item.marginPercent / 100),
                    )}{" "}
                    ={" "}
                    <span className="font-semibold text-gray-700">
                      {formatCurrency(itemTotal)}
                    </span>
                  </p>
                </div>

                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => setStatus(item.id, "approved")}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors border ${
                      state.status === "approved"
                        ? "bg-green-500 text-white border-green-500"
                        : "border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-600"
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Aprovar
                  </button>
                  <button
                    onClick={() => setStatus(item.id, "contested")}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors border ${
                      state.status === "contested"
                        ? "bg-red-500 text-white border-red-500"
                        : "border-gray-200 text-gray-600 hover:border-red-400 hover:text-red-600"
                    }`}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Contestar
                  </button>
                </div>
              </div>

              {state.status === "contested" && (
                <div className="mt-2">
                  <Textarea
                    placeholder="Explique o motivo (ex: prefiro dobradiça sem amortecimento)"
                    rows={2}
                    className="text-sm resize-none"
                    value={state.comment}
                    onChange={(e) => setComment(item.id, e.target.value)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-gray-500">
          {Object.values(itemStates).filter((s) => s.status !== null).length} de{" "}
          {items.length} itens respondidos
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
