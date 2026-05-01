"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
  X,
  Upload,
  Image as ImageIcon,
  Video,
  Copy,
  Check,
  TrendingUp,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectForm } from "@/components/projects/project-form";
import { formatCurrency, formatDate } from "@/lib/utils";

interface CostItem {
  id: string;
  name: string;
  category?: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface MediaFile {
  id: string;
  url: string;
  type: string;
  name: string;
  size: number;
  storagePath: string;
}

interface Project {
  id: string;
  name: string;
  description?: string | null;
  date: string;
  marginPercent: number;
  status: string;
  clientId: string;
  totalCost: number;
  finalPrice: number;
  costItems: CostItem[];
  mediaFiles: MediaFile[];
  client: { name: string; slug: string; id: string };
  createdAt?: string;
  updatedAt?: string;
}

const CATEGORIES = [
  "Material",
  "Mão de obra",
  "Transporte",
  "Ferramentas",
  "Alimentação",
  "Outros",
];

export function ProjectDetail({
  project: initialProject,
  username,
}: {
  project: Project;
  username: string;
}) {
  const router = useRouter();
  const [project, setProject] = useState(initialProject);
  const [editOpen, setEditOpen] = useState(false);
  const [addCostOpen, setAddCostOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageFiles = project.mediaFiles.filter((f) => f.type !== "video");

  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    quantity: "1",
    unitPrice: "0",
  });

  const appUrl =
    (process.env.NEXT_PUBLIC_APP_URL ?? typeof window !== "undefined")
      ? window.location.origin
      : "";
  const publicUrl = `${appUrl}/${username}/${project.client.slug}`;

  async function refreshProject() {
    const res = await fetch(`/api/projects/${project.id}`);
    if (res.ok) {
      const data = await res.json();
      setProject(data);
    }
  }

  async function handleAddCostItem() {
    if (!newItem.name || !newItem.quantity || !newItem.unitPrice) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const res = await fetch(`/api/projects/${project.id}/costs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newItem.name,
        category: newItem.category || undefined,
        quantity: parseFloat(newItem.quantity),
        unitPrice: parseFloat(newItem.unitPrice),
      }),
    });

    if (res.ok) {
      toast.success("Item adicionado");
      setNewItem({ name: "", category: "", quantity: "1", unitPrice: "0" });
      setAddCostOpen(false);
      await refreshProject();
    } else {
      const json = await res.json();
      toast.error(json.error ?? "Erro ao adicionar item");
    }
  }

  async function handleDeleteCostItem(id: string) {
    const res = await fetch(`/api/costs/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Item removido");
      await refreshProject();
    } else {
      toast.error("Erro ao remover item");
    }
  }

  async function handleMarginUpdate(margin: number) {
    const res = await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marginPercent: margin }),
    });
    if (res.ok) {
      await refreshProject();
    }
  }

  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/projects/${project.id}/media`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(`Erro ao enviar ${file.name}: ${json.error}`);
      }
    }

    toast.success("Upload concluído");
    setUploading(false);
    await refreshProject();
  }

  async function handleDeleteMedia(id: string) {
    const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Arquivo removido");
      await refreshProject();
    } else {
      toast.error("Erro ao remover arquivo");
    }
  }

  async function handleDeleteProject() {
    if (!confirm(`Excluir projeto "${project.name}"?`)) return;
    const res = await fetch(`/api/projects/${project.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("Projeto excluído");
      router.push(`/dashboard/clients/${project.clientId}`);
    } else {
      toast.error("Erro ao excluir projeto");
    }
  }

  function copyPublicUrl() {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link
          href={`/dashboard/clients/${project.clientId}`}
          className="inline-flex items-center justify-center rounded-lg size-8 hover:bg-muted text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <Badge variant="outline" className="text-xs">
              {project.client.name}
            </Badge>
          </div>
          {project.description && (
            <p className="text-gray-500 mt-1 text-sm">{project.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {formatDate(project.date)}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 hover:text-red-600"
            onClick={handleDeleteProject}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Public Link */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-amber-700 mb-1">
              Link público para o cliente
            </p>
            <p className="text-sm text-amber-900 truncate font-mono">
              {publicUrl}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 border-amber-300 hover:bg-amber-100"
            onClick={copyPublicUrl}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Pricing Panel */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-amber-500" />
            Precificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 text-xs mb-1">Custo total</p>
              <p className="font-bold text-gray-900">
                {formatCurrency(project.totalCost)}
              </p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3">
              <p className="text-gray-500 text-xs mb-1">Margem aplicada</p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  defaultValue={project.marginPercent}
                  className="h-7 w-20 text-sm p-1"
                  onBlur={(e) =>
                    handleMarginUpdate(parseFloat(e.target.value) || 0)
                  }
                />
                <span className="text-gray-500">%</span>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-gray-500 text-xs mb-1">Preço final</p>
              <p className="font-bold text-green-700 text-lg">
                {formatCurrency(project.finalPrice)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Items */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-amber-500" />
              Itens de custo ({project.costItems.length})
            </CardTitle>
            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-600"
              onClick={() => setAddCostOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {project.costItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              Nenhum item adicionado ainda
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-gray-500">
                    <th className="text-left pb-2 font-medium">Item</th>
                    <th className="text-left pb-2 font-medium">Categoria</th>
                    <th className="text-right pb-2 font-medium">Qtd</th>
                    <th className="text-right pb-2 font-medium">Unit.</th>
                    <th className="text-right pb-2 font-medium">Total</th>
                    <th className="pb-2 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {project.costItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="py-2.5 font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="py-2.5 text-gray-500">
                        {item.category && (
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        )}
                      </td>
                      <td className="py-2.5 text-right text-gray-700">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 text-right text-gray-700">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-2.5 text-right font-semibold text-gray-900">
                        {formatCurrency(item.total)}
                      </td>
                      <td className="py-2.5 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 hover:text-red-500"
                          onClick={() => handleDeleteCostItem(item.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t">
                    <td
                      colSpan={4}
                      className="pt-3 text-right font-semibold text-gray-700"
                    >
                      Total dos custos:
                    </td>
                    <td className="pt-3 text-right font-bold text-gray-900">
                      {formatCurrency(project.totalCost)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Media Gallery */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-amber-500" />
              Fotos e vídeos ({project.mediaFiles.length})
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-1" />
              {uploading ? "Enviando..." : "Enviar arquivos"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          {project.mediaFiles.length === 0 ? (
            <div
              className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer hover:border-amber-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">
                Clique ou arraste para enviar fotos e vídeos
              </p>
              <p className="text-gray-400 text-xs mt-1">
                JPG, PNG, MP4, WebM — máx. 50MB por arquivo
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {project.mediaFiles.map((file) => (
                <div
                  key={file.id}
                  className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100"
                >
                  {file.type === "video" ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <Video className="h-8 w-8 text-gray-400" />
                      <p className="text-xs text-gray-400 absolute bottom-1 left-1 right-1 truncate px-1">
                        {file.name}
                      </p>
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover cursor-zoom-in"
                      onClick={() =>
                        setLightboxIndex(
                          imageFiles.findIndex((f) => f.id === file.id),
                        )
                      }
                    />
                  )}
                  <button
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteMedia(file.id)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <div
                className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-amber-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus className="h-6 w-6 text-gray-400" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lightbox */}
      {lightboxIndex !== null && imageFiles.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
            onClick={() => setLightboxIndex(null)}
          >
            <X className="h-6 w-6" />
          </button>
          {imageFiles.length > 1 && (
            <>
              <button
                className="absolute left-4 text-white hover:text-gray-300 p-2 text-3xl leading-none"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(
                    (lightboxIndex - 1 + imageFiles.length) % imageFiles.length,
                  );
                }}
              >
                ‹
              </button>
              <button
                className="absolute right-4 text-white hover:text-gray-300 p-2 text-3xl leading-none"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((lightboxIndex + 1) % imageFiles.length);
                }}
              >
                ›
              </button>
            </>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageFiles[lightboxIndex].url}
            alt={imageFiles[lightboxIndex].name}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded"
            onClick={(e) => e.stopPropagation()}
          />
          {imageFiles.length > 1 && (
            <p className="absolute bottom-4 text-white/60 text-sm">
              {lightboxIndex + 1} / {imageFiles.length}
            </p>
          )}
        </div>
      )}

      {/* Add Cost Item Dialog */}
      <Dialog open={addCostOpen} onOpenChange={setAddCostOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar item de custo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do item *</Label>
              <Input
                placeholder="Ex: MDF 15mm, Parafuso, Tinta..."
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={newItem.category ?? ""}
                onValueChange={(v: string | null) =>
                  setNewItem({ ...newItem, category: v ?? "" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Quantidade *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newItem.quantity}
                  onChange={(e) =>
                    setNewItem({ ...newItem, quantity: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Valor unitário (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newItem.unitPrice}
                  onChange={(e) =>
                    setNewItem({ ...newItem, unitPrice: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <span className="text-gray-500">Total: </span>
              <span className="font-bold">
                {formatCurrency(
                  (parseFloat(newItem.quantity) || 0) *
                    (parseFloat(newItem.unitPrice) || 0),
                )}
              </span>
            </div>
            <Button
              className="w-full bg-amber-500 hover:bg-amber-600"
              onClick={handleAddCostItem}
            >
              Adicionar item
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar projeto</DialogTitle>
          </DialogHeader>
          <ProjectForm
            clientId={project.clientId}
            projectId={project.id}
            initialData={{
              name: project.name,
              description: project.description ?? "",
              marginPercent: project.marginPercent,
              date: project.date.slice(0, 10),
            }}
            onSuccess={() => {
              setEditOpen(false);
              refreshProject();
              toast.success("Projeto atualizado!");
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
