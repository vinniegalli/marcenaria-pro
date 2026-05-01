"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Users,
  Phone,
  Mail,
  Folder,
  Trash2,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ClientForm } from "@/components/clients/client-form";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const { data, mutate, isLoading } = useSWR(
    `/api/clients?search=${encodeURIComponent(search)}`,
    fetcher,
  );

  const clients = data?.clients ?? [];

  async function handleDelete(id: string, name: string) {
    if (
      !confirm(`Excluir cliente "${name}"? Todos os projetos serão removidos.`)
    )
      return;
    const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Cliente excluído");
      mutate();
    } else {
      toast.error("Erro ao excluir cliente");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1">
            {data?.total ?? 0} cliente(s) cadastrado(s)
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger>
            <Button className="bg-amber-500 hover:bg-amber-600">
              <Plus className="h-4 w-4 mr-2" />
              Novo cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo cliente</DialogTitle>
            </DialogHeader>
            <ClientForm
              onSuccess={() => {
                setCreateOpen(false);
                mutate();
                toast.success("Cliente criado!");
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por nome ou email..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-40 bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-16">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {search ? "Nenhum cliente encontrado" : "Nenhum cliente ainda"}
          </p>
          {!search && (
            <Button
              className="mt-4 bg-amber-500 hover:bg-amber-600"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar primeiro cliente
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map(
            (client: {
              id: string;
              name: string;
              email?: string;
              phone?: string;
              _count?: { projects: number };
            }) => (
              <Card
                key={client.id}
                className="hover:shadow-md transition-shadow group"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/dashboard/clients/${client.id}`}
                        className="font-semibold text-gray-900 hover:text-amber-600 transition-colors line-clamp-1"
                      >
                        {client.name}
                      </Link>
                      {client.email && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 truncate">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          {client.email}
                        </p>
                      )}
                      {client.phone && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3 flex-shrink-0" />
                          {client.phone}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <Link
                        href={`/dashboard/clients/${client.id}/edit`}
                        className="inline-flex items-center justify-center rounded-lg size-7 hover:bg-muted text-gray-700"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:text-red-500"
                        onClick={() => handleDelete(client.id, client.name)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Folder className="h-3 w-3" />
                      {client._count?.projects ?? 0} projeto(s)
                    </Badge>
                    <Link
                      href={`/dashboard/clients/${client.id}`}
                      className="text-xs text-amber-600 hover:underline"
                    >
                      Ver detalhes →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ),
          )}
        </div>
      )}
    </div>
  );
}
