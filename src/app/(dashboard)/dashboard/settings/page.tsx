"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Loader2,
  User,
  Lock,
  CreditCard,
  CheckCircle2,
  ArrowUpRight,
  Zap,
  XCircle,
} from "lucide-react";
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
import {
  PLAN_LABELS,
  PLAN_PRICES,
  PLAN_LIMITS,
  type PlanId,
} from "@/lib/plans";

type ProfileData = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof changePasswordSchema>;

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const PLAN_FEATURE_SUMMARY: Record<PlanId, string[]> = {
  free: ["2 clientes", "3 projetos", "3 uploads/projeto", "1 revisão"],
  starter: [
    "15 clientes",
    "30 projetos",
    "20 uploads/projeto",
    "Revisões ilimitadas",
    "PDF do orçamento",
  ],
  pro: [
    "Ilimitado tudo",
    "Perfil público — seja encontrado",
    "Pré-orçamento pelo seu perfil",
    "Multi-usuário",
    "Suporte prioritário",
  ],
};

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const upgraded = searchParams.get("upgraded") === "1";

  const { data: profile, mutate } = useSWR("/api/profile", fetcher);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [usernameError, setUsernameError] = useState("");
  const usernameDebounceRef = useState<ReturnType<typeof setTimeout> | null>(null);

  const currentPlan = (profile?.plan ?? "free") as PlanId;

  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    values: profile
      ? { name: profile.name, phone: profile.phone ?? "" }
      : undefined,
  });

  function handleUsernameChange(value: string) {
    const lower = value.toLowerCase();
    setUsernameInput(lower);

    if (usernameDebounceRef[0]) clearTimeout(usernameDebounceRef[0]);
    if (!lower) { setUsernameStatus("idle"); return; }

    setUsernameStatus("checking");
    usernameDebounceRef[0] = setTimeout(async () => {
      const res = await fetch(`/api/profile?checkUsername=${encodeURIComponent(lower)}`);
      const json = await res.json();
      if (json.error) {
        setUsernameStatus("invalid");
        setUsernameError(json.error);
      } else {
        setUsernameStatus(json.available ? "available" : "taken");
        setUsernameError(json.available ? "" : "Este nome de usuário já está em uso");
      }
    }, 500);
  }

  const passForm = useForm<PasswordData>({
    resolver: zodResolver(changePasswordSchema),
  });

  async function onProfileSubmit(data: ProfileData) {
    if (usernameStatus === "taken" || usernameStatus === "invalid") {
      toast.error(usernameError || "Nome de usuário inválido");
      return;
    }
    setProfileLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, username: usernameInput || undefined }),
      });
      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error);
        return;
      }
      setUsernameInput("");
      setUsernameStatus("idle");
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

  async function handleUpgrade(plan: "starter" | "pro") {
    setCheckoutLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      let json: { url?: string; error?: string } = {};
      try {
        json = await res.json();
      } catch {
        /* empty body */
      }
      if (!res.ok) {
        toast.error(json.error ?? "Erro ao iniciar checkout");
        return;
      }
      if (json.url) window.location.href = json.url;
    } finally {
      setCheckoutLoading(null);
    }
  }

  async function handleManageBilling() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      let json: { url?: string; error?: string } = {};
      try {
        json = await res.json();
      } catch {
        /* empty body */
      }
      if (!res.ok) {
        toast.error(json.error ?? "Erro ao abrir portal de cobrança");
        return;
      }
      if (json.url) window.location.href = json.url;
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500 mt-1">
          Gerencie seu perfil, segurança e plano
        </p>
      </div>

      {upgraded && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm">
          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
          <p>
            <strong>Upgrade realizado!</strong> Seu plano foi atualizado com
            sucesso.
          </p>
        </div>
      )}

      {/* Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Plano atual
          </CardTitle>
          <CardDescription>
            Gerencie sua assinatura e limites de uso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current plan badge */}
          <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl p-4">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="font-bold text-gray-900">
                  Plano {PLAN_LABELS[currentPlan]}
                </span>
                {currentPlan === "free" && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    Grátis
                  </span>
                )}
              </div>
              <ul className="mt-2 space-y-0.5">
                {PLAN_FEATURE_SUMMARY[currentPlan].map((f) => (
                  <li
                    key={f}
                    className="text-xs text-gray-500 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-extrabold text-gray-900">
                {PLAN_PRICES[currentPlan] === 0
                  ? "R$ 0"
                  : `R$ ${PLAN_PRICES[currentPlan]}`}
              </p>
              {currentPlan !== "free" && (
                <p className="text-xs text-gray-400">/mês</p>
              )}
            </div>
          </div>

          {/* Upgrade options */}
          {currentPlan === "free" && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fazer upgrade
              </p>
              <button
                onClick={() => handleUpgrade("starter")}
                disabled={checkoutLoading === "starter"}
                className="w-full flex items-center justify-between border-2 border-amber-300 bg-amber-50 hover:bg-amber-100 rounded-xl px-4 py-3 transition-colors text-left"
              >
                <div>
                  <p className="font-bold text-amber-800 text-sm">
                    Starter — R$ 49/mês
                  </p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    15 clientes · 30 projetos · PDF · Revisões ilimitadas
                  </p>
                </div>
                {checkoutLoading === "starter" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                ) : (
                  <ArrowUpRight className="h-4 w-4 text-amber-500" />
                )}
              </button>
              <button
                onClick={() => handleUpgrade("pro")}
                disabled={checkoutLoading === "pro"}
                className="w-full flex items-center justify-between border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-xl px-4 py-3 transition-colors text-left"
              >
                <div>
                  <p className="font-bold text-gray-800 text-sm">
                    Pro — R$ 129/mês
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Ilimitado · Multi-usuário · Domínio personalizado
                  </p>
                </div>
                {checkoutLoading === "pro" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                ) : (
                  <ArrowUpRight className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
          )}

          {currentPlan === "starter" && (
            <div className="space-y-2">
              <button
                onClick={() => handleUpgrade("pro")}
                disabled={checkoutLoading === "pro"}
                className="w-full flex items-center justify-between border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 rounded-xl px-4 py-3 transition-colors text-left"
              >
                <div>
                  <p className="font-bold text-gray-800 text-sm">
                    Upgrade para Pro — R$ 129/mês
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Ilimitado · Multi-usuário · Domínio personalizado
                  </p>
                </div>
                {checkoutLoading === "pro" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                ) : (
                  <ArrowUpRight className="h-4 w-4 text-gray-500" />
                )}
              </button>
            </div>
          )}

          {currentPlan !== "free" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleManageBilling}
              disabled={portalLoading}
              className="w-full"
            >
              {portalLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="mr-2 h-4 w-4" />
              )}
              Gerenciar assinatura / fatura
            </Button>
          )}
        </CardContent>
      </Card>

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
              <a
                href={`/${profile.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-amber-600 hover:underline"
              >
                /{profile.username}
              </a>
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
            <div className="space-y-2">
              <Label htmlFor="username">
                Nome de usuário (URL pública)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  /
                </span>
                <Input
                  id="username"
                  className="pl-6 pr-8"
                  placeholder={profile?.username ?? "seu-usuario"}
                  value={usernameInput}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                />
                {usernameStatus === "checking" && (
                  <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                )}
                {usernameStatus === "available" && (
                  <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {(usernameStatus === "taken" || usernameStatus === "invalid") && (
                  <XCircle className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {usernameStatus === "available" && (
                <p className="text-xs text-green-600">Disponível!</p>
              )}
              {(usernameStatus === "taken" || usernameStatus === "invalid") && (
                <p className="text-xs text-red-500">{usernameError}</p>
              )}
              <p className="text-xs text-gray-400">
                Deixe em branco para manter o atual. Apenas letras minúsculas, números, . _ e -
              </p>
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
