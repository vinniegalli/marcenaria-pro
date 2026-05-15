# MarcenariaPro — Plano SaaS

## Visão geral

Plataforma SaaS para marceneiros autônomos e pequenas marcenarias gerenciarem clientes, projetos, orçamentos e revisões com o cliente via link público.

---

## Status de implementação

### ✅ Concluído (14/05/2026)

#### Infraestrutura SaaS

- [x] `prisma/schema.prisma` — campos `plan` e `stripeCustomerId` adicionados ao modelo `User`
- [x] SQL aplicado no Supabase: `ALTER TABLE "User" ADD COLUMN "plan"` + `"stripeCustomerId"`
- [x] `src/lib/stripe.ts` — singleton Stripe + constantes de price IDs (apiVersion: `2026-04-22.dahlia`)
- [x] `src/lib/plans.ts` — `PLAN_LIMITS`, `getLimit()`, `PLAN_LABELS`, `PLAN_PRICES`, `PlanId`

#### APIs Stripe

- [x] `POST /api/stripe/checkout` — cria/reutiliza customer, inicia sessão de checkout com `subscription_data.metadata.userId`
- [x] `POST /api/stripe/webhook` — verifica assinatura, atualiza `user.plan` nos eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- [x] `POST /api/stripe/portal` — abre Billing Portal em `pt-BR`

#### Enforcement de limites (HTTP 403 com mensagem clara)

- [x] `POST /api/clients` — limite de clientes por plano
- [x] `POST /api/clients/[clientId]/projects` — limite de projetos por plano
- [x] `POST /api/projects/[projectId]/media` — limite de uploads por projeto
- [x] `POST /api/supply-items` — limite de itens de insumo

#### Frontend

- [x] Landing page (`/`) — hero, features, how it works, pricing preview, CTA
- [x] Página de preços (`/pricing`) com `CheckoutButton` (client component com loading + fallback para `/register`)
- [x] Settings (`/dashboard/settings`) — exibe plano atual, botões de upgrade, "Gerenciar assinatura", banner de sucesso `?upgraded=1`
- [x] `GET /api/profile` retorna campo `plan`

#### Fixes técnicos

- [x] Rota pública movida de `[projectId]` para `p/[projectId]` (conflito de slug com `[username]`)
- [x] `turbopack.root` configurado em `next.config.ts` para resolver `tailwindcss` corretamente
- [x] `publicUrl` atualizado para `/p/${project.id}` em `project-detail.tsx`

---

## Planos e preços

| Feature                  | Free       | Starter       | Pro            |
| ------------------------ | ---------- | ------------- | -------------- |
| Clientes ativos          | 2          | 15            | Ilimitado      |
| Projetos ativos          | 3          | 30            | Ilimitado      |
| Upload por projeto       | 3 arquivos | 20 arquivos   | Ilimitado      |
| Revisões de orçamento    | 1          | Ilimitado     | Ilimitado      |
| Link público por projeto | ✅         | ✅            | ✅             |
| WhatsApp share           | ✅         | ✅            | ✅             |
| Itens de insumo (supply) | 10         | Ilimitado     | Ilimitado      |
| Dashboard financeiro     | Básico     | Completo      | Completo       |
| PDF do orçamento         | ❌         | ✅            | ✅             |
| Histórico de projetos    | 30 dias    | 1 ano         | Ilimitado      |
| Domínio personalizado    | ❌         | ❌            | ✅             |
| Multi-usuário / equipe   | ❌         | ❌            | ✅             |
| Suporte                  | Comunidade | Email         | Prioritário    |
| **Preço**                | **Grátis** | **R$ 49/mês** | **R$ 129/mês** |

---

## Próximos passos — Amanhã

### 🚀 Prioridade 1 — Deploy em produção

1. Configurar env vars na Vercel (ou plataforma de deploy):
   ```
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PRICE_STARTER=price_live_...
   STRIPE_PRICE_PRO=price_live_...
   STRIPE_WEBHOOK_SECRET=whsec_live_...
   NEXT_PUBLIC_APP_URL=https://seudominio.com
   DATABASE_URL=...
   DIRECT_URL=...
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
2. Ativar **modo live** no painel da Stripe
3. Recriar os produtos/preços em modo live (novos `price_live_...`)
4. Registrar webhook de produção: `https://seudominio.com/api/stripe/webhook`
   - Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

---

### 🎨 Prioridade 2 — Banner de limite no frontend

Quando a API retorna HTTP 403, o frontend atualmente não exibe feedback visível ao usuário em alguns casos. Implementar:

- Toast com mensagem de limite + botão "Fazer upgrade" nos componentes:
  - `client-form.tsx` (criar cliente)
  - `project-form.tsx` (criar projeto)
  - Upload de mídia no `project-detail.tsx`
  - `supply-items-page.tsx`

---

### 📄 Prioridade 3 — PDF do orçamento (gatilho de conversão Free → Starter)

Feature mais importante para conversão. Fluxo:

1. Botão "Exportar PDF" visível no `project-detail.tsx` (bloqueado com cadeado no Free)
2. Rota `GET /api/projects/[projectId]/pdf` — gera PDF com: logo, dados do cliente, itens de custo, preço final, fotos
3. Biblioteca sugerida: `@react-pdf/renderer` ou `puppeteer` (via screenshot da página pública)

---

### 🔔 Prioridade 4 — Notificações

- Email/WhatsApp para marceneiro quando cliente submete revisão
- Email para cliente quando marceneiro confirma revisão
- Usar `RESEND_API_KEY` (já configurada no `.env.local`)

---

## Roadmap futuro (v2.x+)

- [ ] Status do projeto com etapas visíveis ao cliente (Orçamento → Aprovado → Em produção → Entregue)
- [ ] Assinatura digital do orçamento no link público
- [ ] Multi-usuário / equipe (plano Pro)
- [ ] Catálogo de serviços reutilizáveis
- [ ] Integração de pagamento de sinal (Stripe Pix)
- [ ] Galeria de portfólio pública `/{username}`
- [ ] App mobile PWA
- [ ] Marketplace de marceneiros por região
- [ ] Relatórios financeiros avançados

## Visão geral

Plataforma SaaS para marceneiros autônomos e pequenas marcenarias gerenciarem clientes, projetos, orçamentos e revisões com o cliente via link público.

---

## Planos e preços

| Feature                  | Free       | Starter       | Pro            |
| ------------------------ | ---------- | ------------- | -------------- |
| Clientes ativos          | 2          | 15            | Ilimitado      |
| Projetos ativos          | 3          | 30            | Ilimitado      |
| Upload por projeto       | 3 arquivos | 20 arquivos   | Ilimitado      |
| Revisões de orçamento    | 1          | Ilimitado     | Ilimitado      |
| Link público por projeto | ✅         | ✅            | ✅             |
| WhatsApp share           | ✅         | ✅            | ✅             |
| Itens de insumo (supply) | 10         | Ilimitado     | Ilimitado      |
| Dashboard financeiro     | Básico     | Completo      | Completo       |
| PDF do orçamento         | ❌         | ✅            | ✅             |
| Histórico de projetos    | 30 dias    | 1 ano         | Ilimitado      |
| Domínio personalizado    | ❌         | ❌            | ✅             |
| Multi-usuário / equipe   | ❌         | ❌            | ✅             |
| Suporte                  | Comunidade | Email         | Prioritário    |
| **Preço**                | **Grátis** | **R$ 49/mês** | **R$ 129/mês** |

---

## Implementação técnica dos limites

### Schema Prisma

Adicionar campo `plan` ao modelo `User`:

```prisma
model User {
  // ...
  plan String @default("free") // "free" | "starter" | "pro"
}
```

### Helper centralizado

Arquivo `src/lib/plans.ts`:

```ts
export const PLAN_LIMITS = {
  free: { clients: 2, projects: 3, uploads: 3, reviews: 1, supplyItems: 10 },
  starter: {
    clients: 15,
    projects: 30,
    uploads: 20,
    reviews: Infinity,
    supplyItems: Infinity,
  },
  pro: {
    clients: Infinity,
    projects: Infinity,
    uploads: Infinity,
    reviews: Infinity,
    supplyItems: Infinity,
  },
} as const;

export function getLimit(plan: string, key: keyof typeof PLAN_LIMITS.free) {
  return (
    PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]?.[key] ??
    PLAN_LIMITS.free[key]
  );
}
```

### Enforcement nas rotas

Cada route handler verifica antes de criar recursos:

```ts
const count = await prisma.client.count({ where: { userId } });
if (count >= getLimit(user.plan, "clients")) {
  return NextResponse.json(
    { error: "Limite do plano atingido", upgrade: true },
    { status: 403 },
  );
}
```

O frontend trata `upgrade: true` abrindo modal de upgrade.

---

## Roadmap de features

### Curto prazo (v1.x)

- [ ] **PDF do orçamento** — exportar projeto com logo, itens, preço e fotos (trigger de conversão Free → Starter)
- [ ] **Assinatura digital do orçamento** — cliente assina no próprio link público
- [ ] **Notificações** — WhatsApp/email para marceneiro quando cliente submete revisão
- [ ] **Status do projeto** — etapas: Orçamento → Aprovado → Em produção → Entregue (cliente acompanha pelo link)
- [ ] **Enforcement de limites** — bloquear criação quando atingir cota do plano + modal de upgrade

### Médio prazo (v2.x)

- [ ] **Multi-usuário / equipe** — 2–3 usuários por conta (plano Pro ou add-on)
- [ ] **Catálogo de serviços** — marceneiro cadastra serviços padrão e reutiliza em projetos
- [ ] **Integração de pagamento** — link de pagamento de sinal via Mercado Pago ou Stripe
- [ ] **App mobile PWA** — dashboard otimizada para mobile
- [ ] **Galeria de portfólio pública** — página `/{username}` com projetos concluídos

### Longo prazo (v3.x)

- [ ] **Marketplace** — marceneiros Pro aparecem em listagem pública por região
- [ ] **Relatórios financeiros** — receita por mês, ticket médio, margem média, projetos em aberto
- [ ] **API pública** — integração com ERPs externos
- [ ] **White-label** — para associações e franquias

---

## Estratégia de crescimento

1. **Lançar Free + Starter** — Pro entra depois com features já validadas
2. **PDF é o gatilho de conversão** — exclusivo Starter, força quem já tem clientes reais
3. **Trial 14 dias Starter** — sem cartão, converte depois
4. **Programa de indicação** — Free que indica ganha 1 mês de Starter
5. **Marketing passivo** — link público do Free exibe "Gerado por MarcenariaPro" com link de cadastro

---

## Integração de pagamento (sugestões)

- **Stripe** — melhor para internacionalização futura, checkout hospedado, webhooks robustos
- **Mercado Pago** — melhor adoção no Brasil, suporte a boleto e Pix
- Recomendação: **Stripe** como primário (Pix via Stripe já disponível no Brasil)

Fluxo: `/pricing` → escolhe plano → Stripe Checkout → webhook atualiza `user.plan` no banco → redirect para `/dashboard`.
