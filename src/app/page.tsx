import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Hammer,
  CheckCircle2,
  Users,
  FolderOpen,
  ImageIcon,
  ClipboardList,
  TrendingUp,
  Share2,
  ArrowRight,
  Star,
  Zap,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-amber-500 rounded-lg p-1.5">
              <Hammer className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">
              MarcenariaPro
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a
              href="#features"
              className="hover:text-amber-600 transition-colors"
            >
              Funcionalidades
            </a>
            <a
              href="#pricing"
              className="hover:text-amber-600 transition-colors"
            >
              Preços
            </a>
            <a href="#how" className="hover:text-amber-600 transition-colors">
              Como funciona
            </a>
          </nav>
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
              Começar grátis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-linear-to-b from-amber-50 to-white pt-20 pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <Zap className="h-3.5 w-3.5" />
            Feito para marceneiros brasileiros
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Gerencie seus projetos{" "}
            <span className="text-amber-500">sem complicação</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Crie orçamentos, compartilhe com clientes, receba revisões e
            acompanhe tudo em um só lugar. Profissional, simples e feito para
            quem trabalha com madeira.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base"
            >
              Criar conta grátis
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#pricing"
              className="inline-flex items-center justify-center gap-2 border border-gray-200 hover:border-amber-300 text-gray-700 font-medium px-8 py-3.5 rounded-xl transition-colors text-base"
            >
              Ver planos e preços
            </a>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Sem cartão de crédito. Plano grátis para sempre.
          </p>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-10 border-y border-gray-100 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 flex flex-wrap items-center justify-center gap-8 text-center">
          {[
            { value: "100%", label: "Feito para marceneiros" },
            { value: "Link público", label: "Para o cliente revisar" },
            { value: "WhatsApp", label: "Compartilhamento direto" },
            { value: "Sem papel", label: "Orçamento digital" },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-2xl font-bold text-amber-500">{item.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Tudo que você precisa, nada do que não precisa
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Ferramentas pensadas para o dia a dia de quem faz marcenaria, não
              para quem faz planilha.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: FolderOpen,
                title: "Projetos organizados",
                desc: "Cada cliente tem seus projetos separados. Fotos, descrição, data e histórico em um só lugar.",
                color: "bg-blue-50 text-blue-500",
              },
              {
                icon: TrendingUp,
                title: "Orçamento com margem",
                desc: "Calcule o custo dos materiais, aplique sua margem e veja o preço final automaticamente.",
                color: "bg-green-50 text-green-500",
              },
              {
                icon: Share2,
                title: "Link público por projeto",
                desc: "Compartilhe um link exclusivo com o cliente. Ele vê fotos, descrição e valor sem precisar de login.",
                color: "bg-amber-50 text-amber-500",
              },
              {
                icon: ClipboardList,
                title: "Revisão de itens",
                desc: "Envie o orçamento para revisão. O cliente aprova, recusa ou sugere alternativas item a item.",
                color: "bg-purple-50 text-purple-500",
              },
              {
                icon: ImageIcon,
                title: "Galeria de fotos e vídeos",
                desc: "Faça upload de imagens e vídeos do projeto. O cliente vê tudo pelo link público.",
                color: "bg-rose-50 text-rose-500",
              },
              {
                icon: Users,
                title: "Gestão de clientes",
                desc: "Cadastre clientes, vincule projetos e acesse todo o histórico de cada um rapidamente.",
                color: "bg-orange-50 text-orange-500",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-amber-200 hover:shadow-sm transition-all"
              >
                <div className={`inline-flex rounded-xl p-2.5 mb-4 ${f.color}`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-4 bg-amber-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Como funciona
            </h2>
            <p className="text-gray-500 text-lg">
              Em menos de 5 minutos você tem um orçamento pronto para o cliente.
            </p>
          </div>
          <div className="space-y-6">
            {[
              {
                step: "1",
                title: "Crie o projeto",
                desc: "Adicione o cliente, nome do projeto, fotos e itens de custo com quantidade e preço unitário.",
              },
              {
                step: "2",
                title: "Defina sua margem",
                desc: "Configure a margem de lucro e veja o preço final calculado automaticamente.",
              },
              {
                step: "3",
                title: "Compartilhe o link",
                desc: "Envie o link pelo WhatsApp. O cliente acessa sem cadastro e vê fotos e orçamento.",
              },
              {
                step: "4",
                title: "Receba a revisão",
                desc: "O cliente aprova ou contesta itens. Você confirma as mudanças e o preço atualiza.",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="flex gap-5 items-start bg-white rounded-2xl p-5 border border-amber-100"
              >
                <div className="bg-amber-500 text-white font-bold text-lg rounded-full h-10 w-10 flex items-center justify-center shrink-0">
                  {s.step}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{s.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Planos simples e transparentes
            </h2>
            <p className="text-gray-500 text-lg">
              Comece grátis. Expanda quando precisar.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {/* Free */}
            <div className="border border-gray-200 rounded-2xl p-6">
              <p className="text-sm font-semibold text-gray-500 mb-1">Free</p>
              <p className="text-4xl font-extrabold text-gray-900 mb-1">R$ 0</p>
              <p className="text-sm text-gray-400 mb-6">Para sempre</p>
              <ul className="space-y-2.5 mb-8 text-sm text-gray-600">
                {[
                  "2 clientes",
                  "3 projetos ativos",
                  "3 fotos por projeto",
                  "1 revisão de orçamento",
                  "Link público por projeto",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block text-center w-full border border-gray-200 hover:border-amber-300 text-gray-700 font-medium py-2.5 rounded-lg transition-colors text-sm"
              >
                Começar grátis
              </Link>
            </div>

            {/* Starter */}
            <div className="border-2 border-amber-500 rounded-2xl p-6 relative shadow-lg shadow-amber-100">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Star className="h-3 w-3 fill-white" />
                  Mais popular
                </span>
              </div>
              <p className="text-sm font-semibold text-amber-600 mb-1">
                Starter
              </p>
              <p className="text-4xl font-extrabold text-gray-900 mb-1">
                R$ 49
              </p>
              <p className="text-sm text-gray-400 mb-6">por mês</p>
              <ul className="space-y-2.5 mb-8 text-sm text-gray-600">
                {[
                  "15 clientes",
                  "30 projetos ativos",
                  "20 fotos por projeto",
                  "Revisões ilimitadas",
                  "PDF do orçamento",
                  "Dashboard financeiro completo",
                  "Histórico de 1 ano",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className="block text-center w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
              >
                Assinar Starter
              </Link>
            </div>

            {/* Pro */}
            <div className="border border-gray-200 rounded-2xl p-6">
              <p className="text-sm font-semibold text-gray-500 mb-1">Pro</p>
              <p className="text-4xl font-extrabold text-gray-900 mb-1">
                R$ 129
              </p>
              <p className="text-sm text-gray-400 mb-6">por mês</p>
              <ul className="space-y-2.5 mb-8 text-sm text-gray-600">
                {[
                  "Clientes ilimitados",
                  "Projetos ilimitados",
                  "Uploads ilimitados",
                  "Revisões ilimitadas",
                  "Tudo do Starter",
                  "Multi-usuário / equipe",
                  "Domínio personalizado",
                  "Suporte prioritário",
                  "Histórico ilimitado",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className="block text-center w-full border border-gray-200 hover:border-amber-300 text-gray-700 font-medium py-2.5 rounded-lg transition-colors text-sm"
              >
                Assinar Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-linear-to-br from-amber-500 to-orange-500">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Pronto para organizar sua marcenaria?
          </h2>
          <p className="text-amber-100 text-lg mb-8">
            Crie sua conta grátis agora e comece a impressionar seus clientes
            com orçamentos profissionais.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-amber-600 font-bold px-8 py-4 rounded-xl hover:bg-amber-50 transition-colors text-base"
          >
            Criar conta grátis
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

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
            <Link href="/login" className="hover:text-white transition-colors">
              Entrar
            </Link>
            <Link
              href="/register"
              className="hover:text-white transition-colors"
            >
              Cadastrar
            </Link>
            <Link
              href="/pricing"
              className="hover:text-white transition-colors"
            >
              Preços
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
