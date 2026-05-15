# MarcenariaPro — Plano SaaS

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
