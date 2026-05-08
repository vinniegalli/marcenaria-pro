import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Informe a senha"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual"),
    newPassword: z.string().min(8, "Nova senha deve ter ao menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Senhas não conferem",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Senhas não conferem",
    path: ["confirmPassword"],
  });

export const clientSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export const projectSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  description: z.string().optional(),
  date: z.string().optional(),
  marginPercent: z.coerce.number().min(0).max(1000).default(0),
  priceVisible: z.boolean().optional(),
});

export const costItemSchema = z.object({
  name: z.string().min(1, "Informe o nome do item"),
  category: z.string().optional(),
  quantity: z.coerce.number().positive("Quantidade deve ser positiva"),
  unitPrice: z.coerce.number().min(0, "Valor não pode ser negativo"),
  altName: z.string().optional(),
  altUnitPrice: z.coerce.number().min(0).optional().nullable(),
  requiresReview: z.boolean().optional(),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  phone: z.string().optional(),
});

export const supplyItemSchema = z.object({
  name: z.string().min(1, "Informe o nome do item"),
  category: z.string().optional(),
  unitPrice: z.coerce.number().min(0, "Valor não pode ser negativo"),
});
