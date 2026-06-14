"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle2, Send } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Props {
  requestId: string;
  initialStatus: string;
  initialData: { priceMin: string; priceMax: string; responseNote: string; validDays: string };
  respondedAt: string | null;
}

export function QuoteRespondForm({ requestId, initialStatus, initialData, respondedAt }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [form, setForm] = useState(initialData);
  const [sending, setSending] = useState(false);

  async function handleRespond() {
    setSending(true);
    const res = await fetch(`/api/quote-requests/${requestId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Resposta enviada para o cliente!");
      setStatus("responded");
    } else {
      const json = await res.json();
      toast.error(json.error ?? "Erro ao enviar resposta");
    }
    setSending(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          {status === "responded" ? (
            <><CheckCircle2 className="h-4 w-4 text-green-500" /> Resposta enviada</>
          ) : (
            "Enviar pré-orçamento"
          )}
        </CardTitle>
        {status === "responded" && respondedAt && (
          <p className="text-xs text-gray-400">Em {formatDate(respondedAt)}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="priceMin">Preço mínimo (R$)</Label>
            <Input
              id="priceMin"
              type="number"
              placeholder="5000"
              value={form.priceMin}
              onChange={(e) => setForm({ ...form, priceMin: e.target.value })}
              disabled={status === "responded"}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="priceMax">Preço máximo (R$)</Label>
            <Input
              id="priceMax"
              type="number"
              placeholder="8000"
              value={form.priceMax}
              onChange={(e) => setForm({ ...form, priceMax: e.target.value })}
              disabled={status === "responded"}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="responseNote">Mensagem para o cliente</Label>
          <textarea
            id="responseNote"
            className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none disabled:opacity-60"
            placeholder="Ex: Com base nas informações fornecidas, o projeto de cozinha planejada pode custar entre R$ 5.000 e R$ 8.000, incluindo materiais e mão de obra..."
            value={form.responseNote}
            onChange={(e) => setForm({ ...form, responseNote: e.target.value })}
            disabled={status === "responded"}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="validDays">Válido por (dias)</Label>
          <Input
            id="validDays"
            type="number"
            placeholder="15"
            className="w-32"
            value={form.validDays}
            onChange={(e) => setForm({ ...form, validDays: e.target.value })}
            disabled={status === "responded"}
          />
        </div>

        {status !== "responded" && (
          <Button
            onClick={handleRespond}
            disabled={sending}
            className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
          >
            <Send className="h-4 w-4" />
            {sending ? "Enviando..." : "Enviar pré-orçamento ao cliente"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
