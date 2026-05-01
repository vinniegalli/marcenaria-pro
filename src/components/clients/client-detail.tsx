"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Phone,
  Mail,
  FileText,
  FolderOpen,
  Pencil,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClientForm } from "@/components/clients/client-form";
import { ProjectForm } from "@/components/projects/project-form";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Props {
  client: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    notes?: string | null;
    slug: string;
    userId: string;
    projects: {
      id: string;
      name: string;
      description?: string | null;
      date: Date;
      marginPercent: number;
      status: string;
      totalCost: number;
      finalPrice: number;
      _count: { costItems: number; mediaFiles: number };
    }[];
  };
}

export function ClientDetail({ client }: Props) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  async function handleDeleteClient() {
    if (
      !confirm(`Excluir "${client.name}"? Todos os projetos serão removidos.`)
    )
      return;
    const res = await fetch(`/api/clients/${client.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Cliente excluído");
      router.push("/dashboard/clients");
    } else {
      toast.error("Erro ao excluir");
    }
  }

  async function handleDeleteProject(id: string, name: string) {
    if (!confirm(`Excluir projeto "${name}"?`)) return;
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Projeto excluído");
      router.refresh();
    } else {
      toast.error("Erro ao excluir projeto");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/clients"
          className="inline-flex items-center justify-center rounded-lg size-8 hover:bg-muted text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 hover:text-red-600"
            onClick={handleDeleteClient}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Client Info */}
      <Card>
        <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {client.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">{client.phone}</span>
            </div>
          )}
          {client.notes && (
            <div className="flex items-start gap-2 text-sm sm:col-span-3">
              <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
              <span className="text-gray-700">{client.notes}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projects */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Projetos ({client.projects.length})
        </h2>
        <Button
          size="sm"
          className="bg-amber-500 hover:bg-amber-600"
          onClick={() => setProjectOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Novo projeto
        </Button>
      </div>

      {client.projects.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-xl">
          <FolderOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum projeto ainda</p>
          <Button
            size="sm"
            className="mt-3 bg-amber-500 hover:bg-amber-600"
            onClick={() => setProjectOpen(true)}
          >
            Criar primeiro projeto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {client.projects.map((project) => (
            <Card
              key={project.id}
              className="hover:shadow-md transition-shadow group"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <Link
                    href={`/dashboard/clients/${client.id}/projects/${project.id}`}
                    className="font-semibold text-gray-900 hover:text-amber-600 transition-colors"
                  >
                    {project.name}
                  </Link>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:text-red-500"
                      onClick={() =>
                        handleDeleteProject(project.id, project.name)
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {project.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                    {project.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <div className="text-sm">
                    <span className="text-gray-500">Total: </span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(project.finalPrice)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {project._count.costItems} itens
                    </Badge>
                    <Link
                      href={`/dashboard/clients/${client.id}/projects/${project.id}`}
                      className="text-xs text-amber-600 hover:underline"
                    >
                      Abrir →
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar cliente</DialogTitle>
          </DialogHeader>
          <ClientForm
            clientId={client.id}
            initialData={{
              name: client.name,
              email: client.email ?? "",
              phone: client.phone ?? "",
              notes: client.notes ?? "",
            }}
            onSuccess={() => {
              setEditOpen(false);
              router.refresh();
              toast.success("Cliente atualizado!");
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={projectOpen} onOpenChange={setProjectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo projeto para {client.name}</DialogTitle>
          </DialogHeader>
          <ProjectForm
            clientId={client.id}
            onSuccess={() => {
              setProjectOpen(false);
              router.refresh();
              toast.success("Projeto criado!");
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
