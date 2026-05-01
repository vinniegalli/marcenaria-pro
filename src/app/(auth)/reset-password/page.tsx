"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Hammer, Loader2, CheckCircle } from "lucide-react";
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
import { resetPasswordSchema } from "@/lib/validations";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type FormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  async function onSubmit(data: FormData) {
    setError("");
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password: data.newPassword,
    });
    if (updateError) {
      setError(updateError.message ?? "Erro ao redefinir senha");
      return;
    }
    setSuccess(true);
    await supabase.auth.signOut();
    setTimeout(() => router.push("/login"), 3000);
  }

  if (success) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="pt-8 text-center space-y-4">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
          <p className="font-semibold text-gray-900">Senha redefinida!</p>
          <p className="text-sm text-gray-500">
            Redirecionando para o login...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Nova senha</CardTitle>
        <CardDescription>Digite e confirme sua nova senha.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">Nova senha</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Mínimo 8 caracteres"
              {...register("newPassword")}
            />
            {errors.newPassword && (
              <p className="text-xs text-red-500">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repita a senha"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Redefinir senha
          </Button>

          <p className="text-center text-sm text-gray-500">
            <Link href="/login" className="text-amber-600 hover:underline">
              Voltar ao login
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mb-8 flex items-center gap-2">
        <div className="bg-amber-500 rounded-lg p-2">
          <Hammer className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900">MarcenariaPro</span>
      </div>
      <ResetPasswordForm />
    </div>
  );
}
