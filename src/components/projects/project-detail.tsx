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
  Eye,
  EyeOff,
  SendHorizonal,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Loader2,
  FileDown,
  Lock,
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
  altName?: string | null;
  altUnitPrice?: number | null;
  activeOption?: string;
  requiresReview: boolean;
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

interface BudgetItemReview {
  id: string;
  costItemId: string;
  itemStatus: string;
  selectedOption?: string;
  comment?: string | null;
  costItem: { id: string; name: string };
}

interface BudgetReview {
  id: string;
  projectId: string;
  status: string;
  sentAt: string;
  submittedAt?: string | null;
  itemReviews: BudgetItemReview[];
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
  priceVisible: boolean;
  costItems: CostItem[];
  mediaFiles: MediaFile[];
  client: { name: string; slug: string; id: string };
  createdAt?: string;
  updatedAt?: string;
  budgetReview?: BudgetReview | null;
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
  userPlan = "free",
}: {
  project: Project;
  username: string;
  userPlan?: string;
}) {
  const router = useRouter();
  const [project, setProject] = useState(initialProject);
  const [editOpen, setEditOpen] = useState(false);
  const [addCostOpen, setAddCostOpen] = useState(false);
  const [editCostOpen, setEditCostOpen] = useState(false);
  const [editingCostItem, setEditingCostItem] = useState<CostItem | null>(null);
  const [editItem, setEditItem] = useState({
    name: "",
    category: "",
    quantity: "1",
    unitPrice: "0",
    altName: "",
    altUnitPrice: "",
    requiresReview: true,
  });
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [togglingPrice, setTogglingPrice] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [sendingReview, setSendingReview] = useState(false);
  const [confirmingReview, setConfirmingReview] = useState(false);
  const [supplySearch, setSupplySearch] = useState("");
  const [supplySuggestions, setSupplySuggestions] = useState<
    { id: string; name: string; unitPrice: number }[]
  >([]);
  const supplyDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageFiles = project.mediaFiles.filter((f) => f.type !== "video");

  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    quantity: "1",
    unitPrice: "0",
    altName: "",
    altUnitPrice: "",
    requiresReview: true,
  });

  const appUrl =
    (process.env.NEXT_PUBLIC_APP_URL ?? typeof window !== "undefined")
      ? window.location.origin
      : "";
  const publicUrl = `${appUrl}/p/${project.id}`;

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
        altName: newItem.altName || undefined,
        altUnitPrice: newItem.altUnitPrice
          ? parseFloat(newItem.altUnitPrice)
          : undefined,
        requiresReview: newItem.requiresReview,
      }),
    });

    if (res.ok) {
      toast.success("Item adicionado");
      setNewItem({
        name: "",
        category: "",
        quantity: "1",
        unitPrice: "0",
        altName: "",
        altUnitPrice: "",
        requiresReview: true,
      });
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

  function openEditCostItem(item: CostItem) {
    setEditingCostItem(item);
    setEditItem({
      name: item.name,
      category: item.category ?? "",
      quantity: String(item.quantity),
      unitPrice: String(item.unitPrice),
      altName: item.altName ?? "",
      altUnitPrice: item.altUnitPrice != null ? String(item.altUnitPrice) : "",
      requiresReview: item.requiresReview,
    });
    setEditCostOpen(true);
  }

  async function handleSaveEditCostItem() {
    if (!editingCostItem) return;
    if (!editItem.name || !editItem.quantity || !editItem.unitPrice) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    const res = await fetch(`/api/costs/${editingCostItem.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editItem.name,
        category: editItem.category || undefined,
        quantity: parseFloat(editItem.quantity),
        unitPrice: parseFloat(editItem.unitPrice),
        altName: editItem.altName || null,
        altUnitPrice: editItem.altUnitPrice
          ? parseFloat(editItem.altUnitPrice)
          : null,
        requiresReview: editItem.requiresReview,
      }),
    });
    if (res.ok) {
      toast.success("Item atualizado");
      setEditCostOpen(false);
      setEditingCostItem(null);
      await refreshProject();
    } else {
      const json = await res.json();
      toast.error(json.error ?? "Erro ao atualizar item");
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

  function shareWhatsApp() {
    const msg = `Olá, ${project.client.name}!  \n\nSeu projeto *${project.name}* está disponível para visualização. Confira as fotos e o orçamento pelo link:\n${publicUrl}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  async function handleTogglePrice() {
    setTogglingPrice(true);
    const res = await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceVisible: !project.priceVisible }),
    });
    if (res.ok) {
      await refreshProject();
      toast.success(
        !project.priceVisible
          ? "Preço visível para o cliente"
          : "Preço ocultado do cliente",
      );
    } else {
      toast.error("Erro ao alterar visibilidade do preço");
    }
    setTogglingPrice(false);
  }

  async function handleConfirmReview() {
    setConfirmingReview(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/review`, {
        method: "PUT",
      });
      if (res.ok) {
        toast.success("Mudanças confirmadas!");
        await refreshProject();
      } else {
        const json = await res.json();
        toast.error(json.error ?? "Erro ao confirmar mudanças");
      }
    } finally {
      setConfirmingReview(false);
    }
  }

  async function handleSendReview() {
    if (project.costItems.length === 0) {
      toast.error("Adicione itens de custo antes de enviar para revisão");
      return;
    }
    setSendingReview(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/review`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Orçamento enviado para revisão do cliente!");
        await refreshProject();
      } else {
        const json = await res.json();
        toast.error(json.error ?? "Erro ao enviar revisão");
      }
    } finally {
      setSendingReview(false);
    }
  }

  function handleSupplyNameChange(value: string) {
    setNewItem({ ...newItem, name: value });
    setSupplySearch(value);
    if (supplyDebounceRef.current) clearTimeout(supplyDebounceRef.current);
    if (!value.trim()) {
      setSupplySuggestions([]);
      return;
    }
    supplyDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/supply-items?search=${encodeURIComponent(value)}`,
        );
        if (res.ok) {
          const data = await res.json();
          setSupplySuggestions(data.items?.slice(0, 6) ?? []);
        }
      } catch {
        // ignore
      }
    }, 250);
  }

  function applySupplySuggestion(item: { name: string; unitPrice: number }) {
    setNewItem({
      ...newItem,
      name: item.name,
      unitPrice: String(item.unitPrice),
    });
    setSupplySuggestions([]);
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
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
        <div className="flex gap-2 shrink-0 flex-wrap justify-end">
          {userPlan === "free" ? (
            <Button
              variant="outline"
              size="sm"
              className="text-gray-400 border-gray-200 cursor-not-allowed"
              title="Disponível no plano Starter"
              onClick={() => { window.location.href = "/pricing"; }}
            >
              <Lock className="h-3.5 w-3.5 mr-1" />
              PDF
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/p/${project.id}?print=1`, "_blank")}
            >
              <FileDown className="h-4 w-4 mr-1" />
              Exportar PDF
            </Button>
          )}
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
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-amber-700 mb-1">
                Link público para o cliente
              </p>
              <p className="text-sm text-amber-900 truncate font-mono">
                {publicUrl}
              </p>
            </div>
            <div className="flex gap-3">
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
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 border-green-300 hover:bg-green-50 text-green-700 gap-1.5"
                onClick={shareWhatsApp}
                title="Enviar pelo WhatsApp"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-amber-200">
            <div>
              <p className="text-xs font-medium text-amber-700">
                {project.priceVisible
                  ? "Preço visível para o cliente"
                  : "Preço oculto do cliente"}
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                {project.priceVisible
                  ? "O cliente pode ver o valor do orçamento"
                  : 'O cliente verá "Orçamento em andamento"'}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className={`shrink-0 border-amber-300 hover:bg-amber-100 gap-1.5 ${
                project.priceVisible ? "" : "text-gray-400"
              }`}
              onClick={handleTogglePrice}
              disabled={togglingPrice}
            >
              {project.priceVisible ? (
                <>
                  <Eye className="h-4 w-4" />
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-amber-200">
            <div>
              <p className="text-xs font-medium text-amber-700">
                Revisão do orçamento
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                {project.budgetReview
                  ? project.budgetReview.status === "submitted"
                    ? "Cliente respondeu a revisão"
                    : project.budgetReview.status === "confirmed"
                      ? "Mudanças confirmadas"
                      : "Aguardando resposta do cliente"
                  : "Envie para o cliente revisar item a item"}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 border-amber-300 hover:bg-amber-100 gap-1.5"
              onClick={handleSendReview}
              disabled={sendingReview}
            >
              {sendingReview ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SendHorizonal className="h-4 w-4" />
              )}
              {project.budgetReview ? "Reenviar" : "Enviar para revisão"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Budget Review Results */}
      {project.budgetReview && (
        <Card
          className={
            project.budgetReview.status === "submitted"
              ? "border-blue-200"
              : project.budgetReview.status === "confirmed"
                ? "border-green-200"
                : "border-amber-200"
          }
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-amber-500" />
              Revisão do orçamento
              <span
                className={`ml-auto text-xs font-normal px-2 py-0.5 rounded-full ${
                  project.budgetReview.status === "submitted"
                    ? "bg-blue-100 text-blue-700"
                    : project.budgetReview.status === "confirmed"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                }`}
              >
                {project.budgetReview.status === "submitted"
                  ? "Revisão recebida"
                  : project.budgetReview.status === "confirmed"
                    ? "Confirmado"
                    : "Aguardando resposta"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {project.budgetReview.status === "pending" ? (
              <p className="text-sm text-gray-500">
                O orçamento foi enviado para revisão. Aguardando o cliente
                responder.
              </p>
            ) : project.budgetReview.itemReviews.length === 0 ? (
              <p className="text-sm text-gray-500">
                O cliente respondeu mas sem itens registrados.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="divide-y divide-gray-100 rounded-lg border overflow-hidden">
                  {project.budgetReview.itemReviews.map((review) => {
                    const costItem = project.costItems.find(
                      (c) => c.id === review.costItemId,
                    );
                    const choseAlternative =
                      review.selectedOption === "alternative";
                    return (
                      <div
                        key={review.id}
                        className="flex items-start gap-3 px-4 py-3 bg-white"
                      >
                        {review.itemStatus === "approved" ||
                        review.itemStatus === "alternative" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {review.costItem.name}
                          </p>
                          {choseAlternative && costItem?.altName && (
                            <p className="text-xs text-amber-700 mt-0.5">
                              Cliente escolheu:{" "}
                              <span className="font-semibold">
                                {costItem.altName}
                              </span>
                            </p>
                          )}
                          {review.comment && (
                            <p className="text-xs text-gray-500 mt-0.5 italic">
                              &quot;{review.comment}&quot;
                            </p>
                          )}
                        </div>
                        <span
                          className={`ml-auto text-xs px-2 py-0.5 rounded-full shrink-0 ${
                            review.itemStatus === "approved"
                              ? "bg-green-100 text-green-700"
                              : review.itemStatus === "alternative"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {review.itemStatus === "approved"
                            ? "Aprovado"
                            : review.itemStatus === "alternative"
                              ? "Op. alternativa"
                              : "Contestado"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Confirm button — only shown when review is submitted (not yet confirmed) */}
                {project.budgetReview.status === "submitted" && (
                  <div className="pt-1">
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 gap-2"
                      onClick={handleConfirmReview}
                      disabled={confirmingReview}
                    >
                      {confirmingReview ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      Confirmar mudanças do cliente
                    </Button>
                    <p className="text-xs text-gray-400 text-center mt-1.5">
                      O cliente verá o preço atualizado após a confirmação
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
              <p className="font-bold text-amber-700">
                {project.marginPercent}%
              </p>
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
                        <div>
                          <span
                            className={
                              item.activeOption === "alternative"
                                ? "line-through text-gray-400"
                                : ""
                            }
                          >
                            {item.name}
                          </span>
                          {item.activeOption === "alternative" &&
                            item.altName && (
                              <span className="block text-amber-700 font-semibold text-xs mt-0.5">
                                ↳ {item.altName} (ativa)
                              </span>
                            )}
                          {item.activeOption !== "alternative" &&
                            item.altName && (
                              <span className="block text-gray-400 text-xs mt-0.5">
                                Alt: {item.altName}
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="py-2.5 text-gray-500">
                        <div className="flex flex-col gap-1">
                          {item.category && (
                            <Badge variant="outline" className="text-xs w-fit">
                              {item.category}
                            </Badge>
                          )}
                          {!item.requiresReview && (
                            <span className="text-xs text-gray-400 italic">
                              não vai p/ revisão
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 text-right text-gray-700">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 text-right text-gray-700">
                        {formatCurrency(
                          item.activeOption === "alternative" &&
                            item.altUnitPrice != null
                            ? item.altUnitPrice
                            : item.unitPrice,
                        )}
                      </td>
                      <td className="py-2.5 text-right font-semibold text-gray-900">
                        {formatCurrency(item.total)}
                      </td>
                      <td className="py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:text-amber-600"
                            onClick={() => openEditCostItem(item)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:text-red-500"
                            onClick={() => handleDeleteCostItem(item.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
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
              <div className="relative">
                <Input
                  placeholder="Ex: MDF 15mm, Parafuso, Tinta..."
                  value={newItem.name}
                  onChange={(e) => handleSupplyNameChange(e.target.value)}
                  autoComplete="off"
                />
                {supplySuggestions.length > 0 && (
                  <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg overflow-hidden">
                    {supplySuggestions.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-amber-50 text-left"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          applySupplySuggestion(s);
                        }}
                      >
                        <span>{s.name}</span>
                        <span className="text-xs text-gray-500 ml-2 shrink-0">
                          {s.unitPrice.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
            <div className="border-t pt-4 space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Opção alternativa (opcional)
              </p>
              <p className="text-xs text-gray-400">
                Se o cliente contestar este item, a opção alternativa será
                oferecida como substituta.
              </p>
              <div className="space-y-2">
                <Label>Nome da alternativa</Label>
                <Input
                  placeholder="Ex: Dobraça sem amortecedor"
                  value={newItem.altName}
                  onChange={(e) =>
                    setNewItem({ ...newItem, altName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Valor unitário da alternativa (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={newItem.altUnitPrice}
                  onChange={(e) =>
                    setNewItem({ ...newItem, altUnitPrice: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="border-t pt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newItem.requiresReview}
                  onChange={(e) =>
                    setNewItem({ ...newItem, requiresReview: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 accent-amber-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Enviar para aprovação do cliente
                  </p>
                  <p className="text-xs text-gray-400">
                    Quando desmarcado, o item conta no valor mas não aparece na
                    revisão do cliente
                  </p>
                </div>
              </label>
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

      {/* Edit Cost Item Dialog */}
      <Dialog open={editCostOpen} onOpenChange={setEditCostOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar item de custo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do item *</Label>
              <Input
                placeholder="Ex: MDF 15mm, Parafuso, Tinta..."
                value={editItem.name}
                onChange={(e) =>
                  setEditItem({ ...editItem, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={editItem.category ?? ""}
                onValueChange={(v: string | null) =>
                  setEditItem({ ...editItem, category: v ?? "" })
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
                  value={editItem.quantity}
                  onChange={(e) =>
                    setEditItem({ ...editItem, quantity: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Valor unitário (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editItem.unitPrice}
                  onChange={(e) =>
                    setEditItem({ ...editItem, unitPrice: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <span className="text-gray-500">Total: </span>
              <span className="font-bold">
                {formatCurrency(
                  (parseFloat(editItem.quantity) || 0) *
                    (parseFloat(editItem.unitPrice) || 0),
                )}
              </span>
            </div>
            <div className="border-t pt-4 space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Opção alternativa (opcional)
              </p>
              <p className="text-xs text-gray-400">
                Se o cliente contestar este item, a opção alternativa será
                oferecida como substituta.
              </p>
              <div className="space-y-2">
                <Label>Nome da alternativa</Label>
                <Input
                  placeholder="Ex: Dobraça sem amortecedor"
                  value={editItem.altName}
                  onChange={(e) =>
                    setEditItem({ ...editItem, altName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Valor unitário da alternativa (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={editItem.altUnitPrice}
                  onChange={(e) =>
                    setEditItem({ ...editItem, altUnitPrice: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="border-t pt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editItem.requiresReview}
                  onChange={(e) =>
                    setEditItem({
                      ...editItem,
                      requiresReview: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 accent-amber-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Enviar para aprovação do cliente
                  </p>
                  <p className="text-xs text-gray-400">
                    Quando desmarcado, o item conta no valor mas não aparece na
                    revisão do cliente
                  </p>
                </div>
              </label>
            </div>
            <Button
              className="w-full bg-amber-500 hover:bg-amber-600"
              onClick={handleSaveEditCostItem}
            >
              Salvar alterações
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
