import Link from "next/link";
import {
  Hammer,
  CheckCircle2,
  ArrowLeft,
  Star,
  Zap,
  Shield,
  HeadphonesIcon,
  FileText,
  Users,
  Infinity as InfinityIcon,
} from "lucide-react";
import { CheckoutButton } from "@/components/pricing/checkout-button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Planos e Preços — MarcenariaPro",
  description: "Escolha o plano ideal para a sua marcenaria.",
};

const plans = [
  {
    id: "free" as const,
    name: "Free",
    price: 0,
    priceLabel: "Grátis para sempre",
    description: "Para experimentar e ver se faz sentido para você.",
    color: "border-gray-200",
    badge: null,
    cta: "Criar conta grátis",
    ctaStyle: "border border-gray-200 hover:border-amber-300 text-gray-700",
    features: [
      { text: "2 clientes ativos", available: true },
      { text: "3 projetos ativos", available: true },
      { text: "3 uploads por projeto", available: true },
      { text: "1 revisão de orçamento", available: true },
      { text: "Link público por projeto", available: true },
      { text: "Compartilhamento via WhatsApp", available: true },
      { text: "Dashboard financeiro básico", available: true },
      { text: "PDF do orçamento", available: false },
      { text: "Histórico completo", available: false },
      { text: "Multi-usuário / equipe", available: false },
      { text: "Domínio personalizado", available: false },
    ],
  },
  {
    id: "starter" as const,
    name: "Starter",
    price: 49,
    priceLabel: "por mês",
    description:
      "Para quem já tem clientes e quer trabalhar com mais profissionalismo.",
    color: "border-amber-500",
    badge: "Mais popular",
    cta: "Assinar Starter",
    ctaStyle: "bg-amber-500 hover:bg-amber-600 text-white",
    features: [
      { text: "15 clientes ativos", available: true },
      { text: "30 projetos ativos", available: true },
      { text: "20 uploads por projeto", available: true },
      { text: "Revisões ilimitadas", available: true },
      { text: "Link público por projeto", available: true },
      { text: "Compartilhamento via WhatsApp", available: true },
      { text: "Dashboard financeiro completo", available: true },
      { text: "PDF do orçamento", available: true },
      { text: "Histórico de 1 ano", available: true },
      { text: "Multi-usuário / equipe", available: false },
      { text: "Domínio personalizado", available: false },
    ],
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: 129,
    priceLabel: "por mês",
    description:
      "Para marcenarias em crescimento que precisam de escala e equipe.",
    color: "border-gray-800",
    badge: null,
    cta: "Assinar Pro",
    ctaStyle: "bg-gray-900 hover:bg-gray-800 text-white",
    features: [
      { text: "Clientes ilimitados", available: true },
      { text: "Projetos ilimitados", available: true },
      { text: "Uploads ilimitados", available: true },
      { text: "Revisões ilimitadas", available: true },
      { text: "Link público por projeto", available: true },
      { text: "Compartilhamento via WhatsApp", available: true },
      { text: "Dashboard financeiro completo", available: true },
      { text: "PDF do orçamento", available: true },
      { text: "Histórico ilimitado", available: true },
      { text: "Multi-usuário / equipe (até 3)", available: true },
      { text: "Domínio personalizado", available: true },
    ],
  },
];

const faqs = [
  {
    q: "Preciso de cartão de crédito para o plano Free?",
    a: "Não. O plano Free é gratuito para sempre e não exige cartão de crédito para criar sua conta.",
  },
  {
    q: "Posso cancelar a qualquer momento?",
    a: "Sim. Você cancela quando quiser, sem multas ou burocracia. Seu plano fica ativo até o fim do período pago.",
  },
  {
    q: "O que acontece se eu atingir o limite do plano Free?",
    a: "Seus projetos e clientes existentes continuam acessíveis, mas você não consegue criar novos até fazer upgrade ou liberar espaço.",
  },
  {
    q: "Os dados ficam seguros?",
    a: "Sim. Usamos Supabase com criptografia em trânsito e em repouso. Seus dados e os dos seus clientes estão protegidos.",
  },
  {
    q: "Posso migrar do Free para o Starter sem perder dados?",
    a: "Sim. O upgrade é imediato e todos os seus projetos, clientes e histórico são mantidos.",
  },
  {
    q: "O PDF do orçamento já está disponível?",
    a: "Sim! O PDF do orçamento já está disponível para os planos Starter e Pro. Com um clique você gera um documento profissional com todos os itens, valores e dados do cliente.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-amber-500 rounded-lg p-1.5">
              <Hammer className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">
              MarcenariaPro
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Criar conta grátis
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="pt-16 pb-12 px-4 text-center bg-linear-to-b from-amber-50 to-white">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar ao início
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Planos e preços
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Comece grátis. Sem cartão de crédito. Faça upgrade quando precisar
            de mais.
          </p>
        </section>

        {/* Plans */}
        <section className="py-12 px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 items-start">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative border-2 ${plan.color} rounded-2xl p-7 ${plan.badge ? "shadow-xl shadow-amber-100" : ""}`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                      <Star className="h-3 w-3 fill-white" />
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-500 mb-2">
                    {plan.name}
                  </p>
                  <div className="flex items-end gap-1 mb-1">
                    {plan.price === 0 ? (
                      <p className="text-4xl font-extrabold text-gray-900">
                        Grátis
                      </p>
                    ) : (
                      <>
                        <span className="text-lg font-bold text-gray-400 mb-1">
                          R$
                        </span>
                        <p className="text-4xl font-extrabold text-gray-900">
                          {plan.price}
                        </p>
                        <span className="text-sm text-gray-400 mb-1">/mês</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{plan.priceLabel}</p>
                  <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <CheckoutButton
                  plan={plan.id}
                  label={plan.cta}
                  className={plan.ctaStyle}
                />

                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-start gap-2 text-sm">
                      <CheckCircle2
                        className={`h-4 w-4 mt-0.5 shrink-0 ${
                          f.available ? "text-green-500" : "text-gray-200"
                        }`}
                      />
                      <span
                        className={
                          f.available
                            ? "text-gray-700"
                            : "text-gray-300 line-through"
                        }
                      >
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Value props */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-10">
              Em todos os planos você tem
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                {
                  icon: Shield,
                  title: "Dados seguros",
                  desc: "Criptografia em trânsito e repouso",
                },
                {
                  icon: Zap,
                  title: "Rápido e confiável",
                  desc: "Infraestrutura em nuvem escalável",
                },
                {
                  icon: HeadphonesIcon,
                  title: "Suporte em português",
                  desc: "Atendimento para marceneiros brasileiros",
                },
                {
                  icon: InfinityIcon,
                  title: "Sem contrato",
                  desc: "Cancele quando quiser, sem multa",
                },
              ].map((v) => (
                <div
                  key={v.title}
                  className="bg-white border border-gray-100 rounded-2xl p-5"
                >
                  <div className="inline-flex bg-amber-50 rounded-xl p-2.5 mb-3">
                    <v.icon className="h-5 w-5 text-amber-500" />
                  </div>
                  <p className="font-bold text-gray-900 text-sm mb-1">
                    {v.title}
                  </p>
                  <p className="text-xs text-gray-500">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Coming soon */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <FileText className="h-3.5 w-3.5" />
              Em breve
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-4">
              O que vem por aí
            </h2>
            <p className="text-gray-500 mb-8">
              Estamos construindo as próximas features. Clientes Starter e Pro
              têm acesso antecipado.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 text-left">
              {[
                {
                  title: "Assinatura digital",
                  desc: "O cliente aprova o orçamento com assinatura direto no link.",
                },
                {
                  title: "Status de etapas",
                  desc: "Orçamento → Aprovado → Em produção → Entregue.",
                },
                {
                  title: "Portfólio público",
                  desc: "Galeria pública de projetos concluídos para divulgação.",
                },
                {
                  title: "Integração de pagamento",
                  desc: "Gere link de pagamento de sinal direto do orçamento.",
                },
                {
                  title: "App mobile PWA",
                  desc: "Acesse e gerencie seus projetos direto pelo celular.",
                },
                {
                  title: "Relatórios financeiros",
                  desc: "Receita por mês, ticket médio e margem média.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100"
                >
                  <CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-10">
              Perguntas frequentes
            </h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq.q}
                  className="bg-white border border-gray-100 rounded-2xl p-5"
                >
                  <p className="font-semibold text-gray-900 mb-2 text-sm">
                    {faq.q}
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 bg-linear-to-br from-amber-500 to-orange-500">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-white mb-4">
              Comece agora, grátis
            </h2>
            <p className="text-amber-100 mb-8">
              Sem cartão de crédito. Crie sua conta e veja como é ter seus
              projetos organizados do jeito certo.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-white text-amber-600 font-bold px-8 py-4 rounded-xl hover:bg-amber-50 transition-colors"
            >
              Criar conta grátis
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-amber-500 rounded-lg p-1">
              <Hammer className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-white">MarcenariaPro</span>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} MarcenariaPro. Todos os direitos
            reservados.
          </p>
          <div className="flex gap-4 text-sm">
            <Link href="/" className="hover:text-white transition-colors">
              Início
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Entrar
            </Link>
            <Link
              href="/register"
              className="hover:text-white transition-colors"
            >
              Cadastrar
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
