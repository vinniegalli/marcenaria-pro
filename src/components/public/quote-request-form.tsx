"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle2, Upload, X } from "lucide-react";

const LOCATIONS = [
  { value: "cozinha", label: "Cozinha" },
  { value: "banheiro", label: "Banheiro" },
  { value: "sala", label: "Sala" },
  { value: "quarto", label: "Quarto" },
  { value: "escritorio", label: "Escritório" },
  { value: "varanda", label: "Varanda" },
  { value: "outro", label: "Outro" },
];

const DEADLINES = [
  { value: "urgente", label: "Urgente (até 1 semana)" },
  { value: "1_mes", label: "Em até 1 mês" },
  { value: "2_3_meses", label: "2 a 3 meses" },
  { value: "sem_pressa", label: "Sem pressa" },
];

export function QuoteRequestForm({ username }: { username: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    location: "",
    dimensions: "",
    description: "",
    deadline: "",
  });

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const remaining = 3 - photos.length;
    setPhotos((prev) => [...prev, ...files.slice(0, remaining)]);
    e.target.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.clientName || !form.clientEmail || !form.location || !form.description || !form.deadline) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/public/${username}/quote-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error ?? "Erro ao enviar solicitação");
        return;
      }

      const { id: quoteRequestId } = await res.json();

      // Upload photos if any
      for (const photo of photos) {
        const fd = new FormData();
        fd.append("file", photo);
        fd.append("quoteRequestId", quoteRequestId);
        await fetch(`/api/public/${username}/quote-request/photos`, {
          method: "POST",
          body: fd,
        });
      }

      setSubmitted(true);
    } catch {
      toast.error("Erro ao enviar solicitação");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Solicitação enviada!</h2>
        <p className="text-gray-500 text-sm max-w-xs mx-auto">
          O marceneiro receberá sua solicitação e entrará em contato com um pré-orçamento em breve.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="clientName">Nome *</Label>
          <Input
            id="clientName"
            placeholder="Seu nome"
            value={form.clientName}
            onChange={(e) => setForm({ ...form, clientName: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="clientEmail">Email *</Label>
          <Input
            id="clientEmail"
            type="email"
            placeholder="seu@email.com"
            value={form.clientEmail}
            onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="clientPhone">Telefone / WhatsApp</Label>
        <Input
          id="clientPhone"
          placeholder="(11) 99999-9999"
          value={form.clientPhone}
          onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Local *</Label>
          <Select value={form.location} onValueChange={(v) => setForm({ ...form, location: v ?? "" })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o ambiente" />
            </SelectTrigger>
            <SelectContent>
              {LOCATIONS.map((l) => (
                <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Prazo desejado *</Label>
          <Select value={form.deadline} onValueChange={(v) => setForm({ ...form, deadline: v ?? "" })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o prazo" />
            </SelectTrigger>
            <SelectContent>
              {DEADLINES.map((d) => (
                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="dimensions">Medidas aproximadas</Label>
        <Input
          id="dimensions"
          placeholder="Ex: 3m x 2,5m x 2,8m (largura x profundidade x altura)"
          value={form.dimensions}
          onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Descreva o projeto *</Label>
        <textarea
          id="description"
          className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          placeholder="Ex: Quero uma cozinha planejada com ilha central, armários até o teto, gavetas com amortecedor e nicho para geladeira..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      {/* Fotos de referência */}
      <div className="space-y-1.5">
        <Label>Fotos de referência (até 3)</Label>
        {photos.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-2">
            {photos.map((photo, i) => (
              <div key={i} className="relative group">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`foto ${i + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        {photos.length < 3 && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handlePhotoChange}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 border border-dashed border-gray-300 rounded-lg px-4 py-2.5 hover:border-gray-400 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Adicionar foto de referência
            </button>
          </>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-500 hover:bg-amber-600 text-white"
      >
        {loading ? "Enviando..." : "Enviar solicitação"}
      </Button>
    </form>
  );
}
