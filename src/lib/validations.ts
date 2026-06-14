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
  category: z.string().nullable().optional(),
  quantity: z.coerce.number().positive("Quantidade deve ser positiva"),
  unitPrice: z.coerce.number().min(0, "Valor não pode ser negativo"),
  altName: z.string().nullable().optional(),
  altUnitPrice: z.coerce.number().min(0).optional().nullable(),
  requiresReview: z.boolean().optional(),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  phone: z.string().optional(),
});

const RESERVED_USERNAMES = new Set([
  "api", "dashboard", "admin", "login", "register", "pricing", "p",
  "settings", "profile", "about", "help", "terms", "privacy", "blog",
  "app", "www", "mail", "support", "conta", "perfil", "solicitar",
]);

export const usernameSchema = z
  .string()
  .min(3, "Mínimo 3 caracteres")
  .max(30, "Máximo 30 caracteres")
  .regex(/^[a-z0-9][a-z0-9._-]*$/, "Apenas letras minúsculas, números, ponto, _ e -")
  .refine((v) => !RESERVED_USERNAMES.has(v), "Este nome de usuário não está disponível");

export const supplyItemSchema = z.object({
  name: z.string().min(1, "Informe o nome do item"),
  category: z.string().optional(),
  unitPrice: z.coerce.number().min(0, "Valor não pode ser negativo"),
});
