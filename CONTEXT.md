# MarcenariaPro — Contexto do Projeto

> Leia este documento no início de cada sessão para pegar contexto sem varrer o código.

---

## O que é

SaaS B2B para marceneiros e pequenas marcenarias brasileiras. Permite:
- Gestão de clientes e projetos
- Orçamentos com itens de custo e margem de lucro
- Link público para o cliente visualizar o orçamento
- Revisão item a item pelo cliente (aprovação / opção alternativa / contestação)
- Export de PDF do orçamento (Starter/Pro)
- Dashboard financeiro básico
- Catálogo de insumos (supply items) reutilizáveis
- Assinaturas Stripe com enforcement de limites por plano

**URL de produção:** https://marcenaria-pro-seven.vercel.app  
**GitHub:** https://github.com/vinniegalli/marcenaria-pro  
**Vercel project ID:** `prj_1fkvRpbgQSWRC3AmNHd92NRuQutH`  
**Vercel org ID:** `team_fzP8TmXcd3JHEnXJLRLjYO2D`

---

## Stack

| Camada | Tech |
|--------|------|
| Framework | Next.js 16.2.4 (App Router) |
| UI | React 19, Tailwind CSS 4, Shadcn/UI, Lucide |
| Auth | Supabase Auth (email/password) |
| Banco | PostgreSQL via Supabase + Prisma 6 ORM |
| Storage | Supabase Storage (fotos/vídeos) |
| Pagamentos | Stripe v22 (checkout + webhook + billing portal) |
| Email | Resend (opcional — graceful fallback sem API key) |
| Data fetch | SWR |
| Forms | React Hook Form + Zod |
| Deploy | Vercel (git integration via GitHub) |

---

## Planos e limites

| Feature | Free | Starter (R$49/mês) | Pro (R$129/mês) |
|---------|------|--------------------|-----------------|
| Clientes | 2 | 15 | ∞ |
| Projetos | 3 | 30 | ∞ |
| Uploads/projeto | 3 | 20 | ∞ |
| Revisões | 1 | ∞ | ∞ |
| Supply items | 10 | ∞ | ∞ |
| Export PDF | ❌ | ✅ | ✅ |

Limites em `src/lib/plans.ts`. Enforcement nas API routes com HTTP 403.

---

## Estrutura de diretórios

```
src/
├── app/
│   ├── (auth)/               # login, register, forgot-password, reset-password
│   ├── (dashboard)/          # autenticado — layout com Sidebar + MobileHeader
│   │   └── dashboard/
│   │       ├── page.tsx      # dashboard com stats financeiros
│   │       ├── clients/      # lista e detalhe de clientes
│   │       │   └── [clientId]/projects/[projectId]/  # editor de projeto
│   │       ├── supply-items/ # catálogo de insumos
│   │       └── settings/     # perfil, plano, billing
│   ├── api/
│   │   ├── auth/             # register, change-password
│   │   ├── clients/          # CRUD + projects sub-route
│   │   ├── projects/[id]/    # CRUD, media, costs, review (GET/POST/PUT)
│   │   ├── costs/[id]/       # update e delete de cost items
│   │   ├── supply-items/     # CRUD + upload CSV/XLSX
│   │   ├── public/           # review pública (cliente submete)
│   │   ├── stripe/           # checkout, webhook, portal
│   │   ├── profile/          # GET/PATCH do usuário
│   │   └── dashboard/        # stats financeiros
│   ├── p/[projectId]/        # link público do orçamento (cliente)
│   │                         # ?print=1 → modo PDF com auto-print
│   ├── pricing/              # página de planos (force-dynamic)
│   └── page.tsx              # landing page
├── components/
│   ├── clients/              # ClientForm
│   ├── projects/             # ProjectDetail (tela principal do marceneiro)
│   │                         # ProjectForm
│   ├── public/               # PublicGallery, BudgetReviewForm, PrintTrigger
│   ├── pricing/              # CheckoutButton
│   ├── supply/               # SupplyItemsPage
│   ├── layout/               # Sidebar (desktop), MobileHeader (drawer)
│   │                         # ⚠️ manter navItems sincronizados nos dois arquivos
│   └── ui/                   # Shadcn primitives
└── lib/
    ├── prisma.ts             # singleton Prisma
    ├── auth.ts               # Supabase auth config
    ├── plans.ts              # PLAN_LIMITS, getLimit(), PLAN_LABELS, PLAN_PRICES
    ├── stripe.ts             # singleton Stripe + price IDs
    ├── email.ts              # Resend — sendReviewSubmittedEmail, sendReviewConfirmedEmail
    ├── api-helpers.ts        # getAuthSession(), unauthorized()
    ├── validations.ts        # schemas Zod
    └── utils.ts              # formatCurrency, formatDate, slugify
```

---

## Schema do banco (Prisma)

```
User          id, name, email, username, phone, plan, stripeCustomerId
Client        id, userId, name, email?, phone?, notes?, slug
Project       id, clientId, userId, name, description?, date, marginPercent,
              status, priceVisible
CostItem      id, projectId, name, category?, quantity, unitPrice,
              altName?, altUnitPrice?, activeOption("primary"), requiresReview
MediaFile     id, projectId, url, storagePath, type, name, size
BudgetReview  id, projectId (1:1), status("pending"|"submitted"|"confirmed"),
              sentAt, submittedAt?
BudgetItemReview  id, budgetReviewId, costItemId, itemStatus, selectedOption, comment?
SupplyItem    id, userId, name, category?, unitPrice
```

---

## Fluxo principal

1. Marceneiro cria cliente → cria projeto → adiciona itens de custo (com opção alternativa)
2. Define margem de lucro → ativa visibilidade do preço
3. Compartilha link público via botão WhatsApp ou copia link
4. Cliente acessa `/p/[projectId]` → vê orçamento → faz revisão item a item
5. Marceneiro recebe email (via Resend) → confirma mudanças → `activeOption` é persistido
6. Marceneiro exporta PDF (Starter/Pro): abre `/p/[projectId]?print=1` em nova aba → browser imprime

---

## Variáveis de ambiente necessárias

```bash
# Banco
DATABASE_URL              # Supabase pooler (pgbouncer)
DIRECT_URL                # Supabase direto (migrations)

# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Stripe
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_STARTER      # price_live_...
STRIPE_PRICE_PRO          # price_live_...

# App
NEXT_PUBLIC_APP_URL       # ex: https://marcenaria-pro-seven.vercel.app

# Email (opcional — app funciona sem)
RESEND_API_KEY
RESEND_FROM               # ex: MarcenariaPro <noreply@seudominio.com>
```

---

## Estado de implementação (junho/2026)

### ✅ Implementado e funcionando

- Auth completo (Supabase email/password)
- CRUD de clientes, projetos, itens de custo, supply items
- Link público + gallery de fotos/vídeos
- Revisão de orçamento (item a item, com opção alternativa)
- Confirmação de revisão com persistência de `activeOption`
- Stripe subscriptions (checkout, webhook, billing portal)
- Enforcement de limites por plano (HTTP 403 + toast com upgrade)
- Export PDF via print mode (`/p/[id]?print=1`)
- Email notifications via Resend (opcional)
- Mobile navigation (MobileHeader com Sheet/drawer)
- Dashboard financeiro básico (receita, custo, margem, projetos recentes)
- Catálogo de supply items com import CSV/XLSX

### 🚧 A implementar (roadmap)

- **Status do projeto** — pipeline visual: Orçamento → Aprovado → Em produção → Entregue
- **Assinatura digital** — cliente assina no link público
- **Portfolio público** — página `/{username}` com projetos concluídos
- **Notificações WhatsApp** — via WhatsApp Business API
- **Integração de pagamento de sinal** — Stripe Pix
- **Trial 14 dias Starter** — sem cartão, converte depois
- **Multi-usuário/equipe** — plano Pro
- **Relatórios financeiros** — receita por mês, ticket médio, margem média
- **App mobile PWA**
- **Programa de indicação** — Free que indica ganha 1 mês de Starter
- **"Gerado por MarcenariaPro"** no link público Free (marketing passivo)

---

## Bugs conhecidos / débito técnico

- `Separator`, `username` importados mas não usados em `project-detail.tsx` (warnings pré-existentes)
- `metadata` na pricing page sem tipo `Metadata` do Next.js (warning)
- `Users` importado mas não usado em `pricing/page.tsx`
- Sem testes automatizados
- Sem rate limiting nas APIs públicas
- Sem debounce na busca de clientes (SWR revalida a cada keystroke)
- Sem soft delete — exclusão de projeto/cliente é permanente

---

## Para fazer deploy

O deploy é via **git integration** do Vercel com GitHub:

```bash
git push origin main   # dispara deploy automático no Vercel
```

Para configurar env vars de produção:
```bash
vercel env add RESEND_API_KEY production
vercel env add STRIPE_SECRET_KEY production
# ... etc
```

Ou pela dashboard: https://vercel.com/vinniegallis-projects/marcenaria-pro/settings/environment-variables

---

## Checklist para ir ao ar (produção)

- [ ] Ativar modo live no Stripe
- [ ] Recriar produtos/preços em modo live (novos `price_live_...`)
- [ ] Configurar `STRIPE_SECRET_KEY` live no Vercel
- [ ] Configurar `STRIPE_PRICE_STARTER` e `STRIPE_PRICE_PRO` com IDs live
- [ ] Registrar webhook live: `https://[dominio]/api/stripe/webhook`
  - Eventos: `checkout.session.completed`, `customer.subscription.updated`,
    `customer.subscription.deleted`, `invoice.payment_failed`
- [ ] Configurar `RESEND_API_KEY` e verificar domínio no Resend
- [ ] Atualizar `NEXT_PUBLIC_APP_URL` para o domínio de produção
- [ ] Verificar `DATABASE_URL` e `DIRECT_URL` apontando para prod
