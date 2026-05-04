"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { forgotPasswordSchema } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";

type FormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      if (error) {
        toast.error("Erro ao enviar email. Tente novamente.");
        return;
      }
      setSent(true);
    } catch {
      toast.error("Erro ao enviar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Recuperar senha</CardTitle>
        <CardDescription>
          {sent
            ? "Verifique seu email para redefinir a senha."
            : "Informe seu email cadastrado e enviaremos as instruções."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!sent ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar instruções
            </Button>
          </form>
        ) : (
          <div className="text-center py-4">
            <p className="text-green-600 font-medium mb-4">Email enviado!</p>
            <p className="text-sm text-gray-600">
              Verifique sua caixa de entrada e spam.
            </p>
          </div>
        )}
        <Link
          href="/login"
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-amber-600 mt-4"
        >
          <ArrowLeft className="h-3 w-3" />
          Voltar para o login
        </Link>
      </CardContent>
    </Card>
  );
}
