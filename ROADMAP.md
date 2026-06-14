# MarcenariaPro — Roadmap

> Última atualização: junho 2026  
> Produto lançado e com Stripe live. Foco atual: conversão e retenção.

---

## Legenda
- 🔥 Alto impacto, implementar logo
- 🟡 Médio impacto, próximo ciclo
- ⚪ Baixo impacto ou dependência externa

---

## 1. Conversão (Free → Pago)

| # | Feature | Plano alvo | Impacto | Notas |
|---|---------|-----------|---------|-------|
| 1.1 | **Trial 14 dias** sem cartão | Starter | 🔥 | Marceneiro usa tudo do Starter por 14 dias. No fim trava e exibe CTA de upgrade. Campo `trialEndsAt` no User. |
| 1.2 | **"Gerado por MarcenariaPro"** no PDF e link público (Free) | Free | 🔥 | Marketing passivo — cada orçamento enviado é um anúncio. No Starter+ pode remover (incentivo de upgrade). |
| 1.3 | **Onboarding guiado** no primeiro acesso | Todos | 🟡 | Checklist: criar cliente → criar projeto → enviar link. Reduz churn no Day 1. |
| 1.4 | **Página de pricing melhorada** | — | 🟡 | Comparativo de planos com casos de uso reais. Depoimentos. |

---

## 2. Retenção (Produto mais valioso)

| # | Feature | Plano alvo | Impacto | Notas |
|---|---------|-----------|---------|-------|
| 2.1 | **Contrato digital** | Pro | 🔥 | Cliente assina o orçamento aprovado digitalmente no link público. Gera PDF do contrato. |
| 2.2 | **Dashboard de métricas** | Todos | 🔥 | Faturamento previsto, projetos por status, taxa de aprovação de orçamentos, clientes ativos. |
| 2.3 | **Lembretes automáticos** | Starter+ | 🟡 | Email automático ao cliente se não respondeu a revisão em N dias. Configurável pelo marceneiro. |
| 2.4 | **Histórico de versões do orçamento** | Pro | 🟡 | O marceneiro pode ver versões anteriores antes de editar itens. |
| 2.5 | **Notas internas por projeto** | Todos | 🟡 | Campo de anotações privadas do marceneiro (não aparece para o cliente). |
| 2.6 | **Data de entrega prevista** | Todos | 🟡 | Campo de prazo no projeto. Dashboard mostra projetos com entrega próxima. |

---

## 3. Aquisição (Novos usuários)

| # | Feature | Plano alvo | Impacto | Notas |
|---|---------|-----------|---------|-------|
| 3.1 | **Busca de marceneiros** | Pro | 🔥 | Diretório público em `/encontrar` com filtro por cidade/área. Depende de perfis bem preenchidos. |
| 3.2 | **Portfólio público melhorado** | Pro | 🟡 | `/{username}` mostra projetos finalizados (status "entregue") com fotos. O marceneiro escolhe quais exibir. |
| 3.3 | **Programa de indicação** | Todos | 🟡 | Marceneiro indica outro marceneiro → ambos ganham X dias de trial. |
| 3.4 | **SEO do perfil público** | Pro | ⚪ | `/{username}` com metadata, OG image dinâmica, sitemap. |

---

## 4. Features do Marceneiro (Operacional)

| # | Feature | Plano alvo | Impacto | Notas |
|---|---------|-----------|---------|-------|
| 4.1 | **Templates de projeto** | Starter+ | 🔥 | Salvar conjunto de itens de custo como template reutilizável (ex: "Cozinha Padrão", "Dormitório Casal"). |
| 4.2 | **Calculadora de material** | Starter+ | 🟡 | Informa dimensões → calcula chapas/metros lineares/dobradiças. Integra com itens de custo. |
| 4.3 | **Relatórios exportáveis** | Pro | 🟡 | Faturamento por período, lista de projetos em CSV/PDF. |
| 4.4 | **Múltiplos usuários / equipe** | Pro | ⚪ | Assistente com acesso restrito. Requer refactor de permissões. |
| 4.5 | **App mobile (PWA)** | Todos | ⚪ | Transformar em PWA instalável. Push notifications nativas. |

---

## 5. Integrações

| # | Feature | Plano alvo | Impacto | Notas |
|---|---------|-----------|---------|-------|
| 5.1 | **WhatsApp Business API** | Pro | 🟡 | Enviar orçamento e resposta de revisão direto pelo WhatsApp. Twilio ou Z-API. |
| 5.2 | **Google Calendar** | Pro | 🟡 | Sincronizar prazo de entrega dos projetos com a agenda do marceneiro. |
| 5.3 | **Nota fiscal (NF-e)** | Pro | ⚪ | Integração com Focus NFe ou similar. Alta complexidade, demanda real por verificar. |
| 5.4 | **Pagamento parcelado via Stripe** | Pro | ⚪ | Marceneiro define % de entrada e parcelas. Link de pagamento para o cliente. |

---

## 6. Infraestrutura / Técnico

| # | Feature | Impacto | Notas |
|---|---------|---------|-------|
| 6.1 | **Domínio customizado** | 🔥 | Sair de `.vercel.app`. Comprar `marcenariaproo.com.br` ou similar. |
| 6.2 | **Resend com domínio verificado** | 🔥 | Emails enviados do domínio oficial evitam spam. |
| 6.3 | **Rate limiting nas APIs públicas** | 🟡 | `/api/public/*` sem auth — adicionar rate limit por IP para evitar abuso. |
| 6.4 | **Testes E2E (Playwright)** | 🟡 | Cobrir fluxo crítico: criar conta → criar projeto → enviar orçamento → cliente aprova. |
| 6.5 | **Error tracking (Sentry)** | 🟡 | Capturar erros de produção automaticamente. |
| 6.6 | **Backup automatizado** | ⚪ | Supabase já faz backup, mas vale configurar exportação periódica. |

---

## Ordem sugerida para o próximo ciclo

1. `6.1` Domínio customizado
2. `1.1` Trial 14 dias
3. `1.2` "Gerado por MarcenariaPro" no Free
4. `2.1` Contrato digital
5. `2.2` Dashboard de métricas
6. `4.1` Templates de projeto
7. `3.1` Busca de marceneiros por cidade
