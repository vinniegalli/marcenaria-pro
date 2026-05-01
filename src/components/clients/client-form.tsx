"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { clientSchema } from "@/lib/validations";

type FormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  initialData?: Partial<FormData>;
  clientId?: string;
  onSuccess: () => void;
}

export function ClientForm({
  initialData,
  clientId,
  onSuccess,
}: ClientFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData,
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const res = await fetch(
        clientId ? `/api/clients/${clientId}` : "/api/clients",
        {
          method: clientId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error);
      }

      onSuccess();
    } catch (err) {
      const error = err as Error;
      alert(error.message ?? "Erro ao salvar cliente");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome *</Label>
        <Input id="name" placeholder="Nome do cliente" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@exemplo.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(11) 99999-9999"
            {...register("phone")}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          placeholder="Anotações sobre o cliente..."
          rows={3}
          {...register("notes")}
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-amber-500 hover:bg-amber-600"
        disabled={loading}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {clientId ? "Salvar alterações" : "Criar cliente"}
      </Button>
    </form>
  );
}
