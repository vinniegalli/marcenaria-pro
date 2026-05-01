"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, User, Lock } from "lucide-react";
import useSWR from "swr";
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
import { Separator } from "@/components/ui/separator";
import { profileSchema, changePasswordSchema } from "@/lib/validations";

type ProfileData = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof changePasswordSchema>;

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function SettingsPage() {
  const { data: profile, mutate } = useSWR("/api/profile", fetcher);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    values: profile
      ? { name: profile.name, phone: profile.phone ?? "" }
      : undefined,
  });

  const passForm = useForm<PasswordData>({
    resolver: zodResolver(changePasswordSchema),
  });

  async function onProfileSubmit(data: ProfileData) {
    setProfileLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error);
        return;
      }
      mutate();
      toast.success("Perfil atualizado!");
    } finally {
      setProfileLoading(false);
    }
  }

  async function onPasswordSubmit(data: PasswordData) {
    setPassLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error);
        return;
      }
      passForm.reset();
      toast.success("Senha alterada com sucesso!");
    } finally {
      setPassLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500 mt-1">Gerencie seu perfil e segurança</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Informações pessoais
          </CardTitle>
          {profile && (
            <CardDescription>
              Seu link público:{" "}
              <span className="font-mono text-amber-600">
                /{profile.username}
              </span>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <form
            onSubmit={profileForm.handleSubmit(onProfileSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...profileForm.register("name")} />
              {profileForm.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {profileForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile?.email ?? ""}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-400">
                Email não pode ser alterado
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                {...profileForm.register("phone")}
              />
            </div>
            <Button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600"
              disabled={profileLoading}
            >
              {profileLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Salvar alterações
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Alterar senha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={passForm.handleSubmit(onPasswordSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha atual</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                {...passForm.register("currentPassword")}
              />
              {passForm.formState.errors.currentPassword && (
                <p className="text-sm text-red-500">
                  {passForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova senha</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                {...passForm.register("newPassword")}
              />
              {passForm.formState.errors.newPassword && (
                <p className="text-sm text-red-500">
                  {passForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...passForm.register("confirmPassword")}
              />
              {passForm.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {passForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button type="submit" variant="outline" disabled={passLoading}>
              {passLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Alterar senha
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
