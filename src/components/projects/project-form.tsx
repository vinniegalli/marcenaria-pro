"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  description: z.string().optional(),
  date: z.string().optional(),
  marginPercent: z.number().min(0).max(1000),
});

type FormData = z.infer<typeof formSchema>;

interface ProjectFormProps {
  clientId: string;
  projectId?: string;
  initialData?: Partial<FormData>;
  onSuccess: () => void;
}

export function ProjectForm({
  clientId,
  projectId,
  initialData,
  onSuccess,
}: ProjectFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      marginPercent: 0,
      ...initialData,
    },
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const res = await fetch(
        projectId
          ? `/api/projects/${projectId}`
          : `/api/clients/${clientId}/projects`,
        {
          method: projectId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      if (!res.ok) {
        const json = await res.json();
        if (res.status === 403) {
          toast.error(json.error, {
            action: { label: "Fazer upgrade", onClick: () => { window.location.href = "/pricing"; } },
          });
        } else {
          toast.error(json.error ?? "Erro ao salvar projeto");
        }
        return;
      }

      onSuccess();
    } catch {
      toast.error("Erro ao salvar projeto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do projeto *</Label>
        <Input
          id="name"
          placeholder="Ex: Cozinha planejada"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          placeholder="Detalhes do projeto..."
          rows={3}
          {...register("description")}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="date">Data</Label>
          <Input id="date" type="date" {...register("date")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="marginPercent">Margem de lucro (%)</Label>
          <Input
            id="marginPercent"
            type="number"
            step="0.5"
            min="0"
            placeholder="30"
            {...register("marginPercent", { valueAsNumber: true })}
          />
          {errors.marginPercent && (
            <p className="text-sm text-red-500">
              {errors.marginPercent.message}
            </p>
          )}
        </div>
      </div>
      <Button
        type="submit"
        className="w-full bg-amber-500 hover:bg-amber-600"
        disabled={loading}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {projectId ? "Salvar alterações" : "Criar projeto"}
      </Button>
    </form>
  );
}
