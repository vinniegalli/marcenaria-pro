"use client";

import { useState, useCallback, useRef } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  Package,
  Loader2,
  Search,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supplyItemSchema } from "@/lib/validations";
import type { SupplyItemData } from "@/types";

// Local form schema keeps unitPrice as string for input, parsed on submit
const formSchema = z.object({
  name: z.string().min(1, "Informe o nome do item"),
  category: z.string().optional(),
  unitPrice: z.string().min(1, "Informe o valor"),
});
type FormData = z.infer<typeof formSchema>;

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface ItemFormProps {
  initialData?: { name?: string; category?: string; unitPrice?: number };
  itemId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function ItemForm({ initialData, itemId, onSuccess, onCancel }: ItemFormProps) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? { ...initialData, unitPrice: String(initialData.unitPrice ?? "") }
      : undefined,
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const payload = {
        name: data.name,
        category: data.category,
        unitPrice: parseFloat(data.unitPrice),
      };
      const res = await fetch(
        itemId ? `/api/supply-items/${itemId}` : "/api/supply-items",
        {
          method: itemId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error);
      }
      onSuccess();
    } catch (err) {
      toast.error((err as Error).message ?? "Erro ao salvar item");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do item *</Label>
        <Input
          id="name"
          placeholder="Ex: Dobradiça amortecida"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Input
            id="category"
            placeholder="Ex: Ferragem"
            {...register("category")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unitPrice">Preço unitário (R$) *</Label>
          <Input
            id="unitPrice"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            {...register("unitPrice")}
          />
          {errors.unitPrice && (
            <p className="text-sm text-red-500">{errors.unitPrice.message}</p>
          )}
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          className="bg-amber-500 hover:bg-amber-600"
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {itemId ? "Salvar" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
}

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function ImportDialog({ open, onOpenChange, onSuccess }: ImportDialogProps) {
  const [replace, setReplace] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleImport() {
    if (!file) {
      toast.error("Selecione um arquivo");
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("replace", String(replace));

      const res = await fetch("/api/supply-items/upload", {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success(
        `${json.imported} item(s) importado(s)${replace ? " — lista substituída!" : "!"}`,
      );
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast.error((err as Error).message ?? "Erro ao importar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar planilha</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            <p className="font-medium mb-1">Formatos aceitos: CSV, XLSX, XLS</p>
            <p>A planilha deve conter as colunas:</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li>
                <strong>nome</strong> (ou name) — nome do item
              </li>
              <li>
                <strong>preço</strong> (ou price, valor, unitprice) — valor
                unitário
              </li>
              <li>
                <strong>categoria</strong> (ou category) — opcional
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label>Arquivo</Label>
            <Input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="replace"
              checked={replace}
              onChange={(e) => setReplace(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="replace" className="cursor-pointer">
              Substituir todos os itens existentes
            </Label>
          </div>

          {replace && (
            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                Todos os seus itens cadastrados serão removidos e substituídos
                pelos do arquivo.
              </span>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleImport}
              disabled={loading || !file}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Upload className="mr-2 h-4 w-4" />
              Importar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SupplyItemsPage() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<SupplyItemData | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const { data, mutate, isLoading } = useSWR(
    `/api/supply-items?search=${encodeURIComponent(search)}`,
    fetcher,
  );

  const items: SupplyItemData[] = data?.items ?? [];

  const handleDelete = useCallback(
    async (id: string, name: string) => {
      if (!confirm(`Remover "${name}" do catálogo?`)) return;
      const res = await fetch(`/api/supply-items/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Item removido");
        mutate();
      } else {
        toast.error("Erro ao remover item");
      }
    },
    [mutate],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Itens de Uso</h1>
          <p className="text-gray-500 mt-1">
            {data?.total ?? 0} item(s) no catálogo
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Importar planilha
          </Button>
          <Button
            className="bg-amber-500 hover:bg-amber-600"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo item
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar item..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-14 bg-gray-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {search ? "Nenhum item encontrado" : "Nenhum item cadastrado ainda"}
          </p>
          {!search && (
            <div className="flex gap-2 justify-center mt-4">
              <Button variant="outline" onClick={() => setImportOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Importar planilha
              </Button>
              <Button
                className="bg-amber-500 hover:bg-amber-600"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar item
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Catálogo de itens</CardTitle>
            <CardDescription>
              Estes itens aparecem como sugestão ao adicionar custos num
              projeto.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {item.name}
                      </p>
                      {item.category && (
                        <Badge variant="secondary" className="text-xs mt-0.5">
                          {item.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                      {formatCurrency(item.unitPrice)}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setEditItem(item)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:text-red-500"
                        onClick={() => handleDelete(item.id, item.name)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo item</DialogTitle>
          </DialogHeader>
          <ItemForm
            onSuccess={() => {
              setCreateOpen(false);
              mutate();
              toast.success("Item adicionado!");
            }}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar item</DialogTitle>
          </DialogHeader>
          {editItem && (
            <ItemForm
              itemId={editItem.id}
              initialData={{
                name: editItem.name,
                category: editItem.category ?? undefined,
                unitPrice: editItem.unitPrice,
              }}
              onSuccess={() => {
                setEditItem(null);
                mutate();
                toast.success("Item atualizado!");
              }}
              onCancel={() => setEditItem(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <ImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onSuccess={() => mutate()}
      />
    </div>
  );
}
