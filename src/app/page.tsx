import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Users,
  FolderOpen,
  ImageIcon,
  ClipboardList,
  TrendingUp,
  Share2,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: "var(--font-jakarta), system-ui, sans-serif" }}
    >
      {/* ── NAV ───────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: "#1A1208",
          borderColor: "rgba(192,139,42,0.15)",
        }}
      >
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <span
            className="text-2xl"
            style={{
              fontFamily: "var(--font-fraunces), serif",
              fontStyle: "italic",
              color: "#FAF7F2",
            }}
          >
            Projetta
          </span>

          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a
              href="#features"
              style={{ color: "#9C8A70" }}
              className="hover:text-[#FAF7F2] transition-colors"
            >
              Funcionalidades
            </a>
            <a
              href="#how"
              style={{ color: "#9C8A70" }}
              className="hover:text-[#FAF7F2] transition-colors"
            >
              Como funciona
            </a>
            <a
              href="#pricing"
              style={{ color: "#9C8A70" }}
              className="hover:text-[#FAF7F2] transition-colors"
            >
              Preços
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm transition-colors hidden sm:block"
              style={{ color: "#9C8A70" }}
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:opacity-90"
              style={{ background: "#C08B2A", color: "#FAF7F2" }}
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section
        className="px-5 pt-16 pb-0 md:pt-24"
        style={{ background: "#1A1208" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-end">
            {/* Left: copy */}
            <div className="pb-16 md:pb-24">
              <div
                className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-8 tracking-wide uppercase"
                style={{
                  background: "rgba(192,139,42,0.15)",
                  color: "#C08B2A",
                  border: "1px solid rgba(192,139,42,0.3)",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#C08B2A" }}
                />
                Para marceneiros brasileiros
              </div>

              <h1
                className="text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-6"
                style={{
                  fontFamily: "var(--font-fraunces), serif",
                  color: "#FAF7F2",
                  fontStyle: "italic",
                }}
              >
                Seus orçamentos merecem mais que uma planilha.
              </h1>

              <p className="text-lg leading-relaxed mb-10 max-w-md" style={{ color: "#9C8A70" }}>
                Crie orçamentos, compartilhe com clientes por WhatsApp e
                acompanhe cada projeto — tudo em um só lugar, feito para quem
                trabalha com madeira.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 font-semibold px-7 py-3.5 rounded-xl transition-all hover:opacity-90 text-base"
                  style={{ background: "#C08B2A", color: "#FAF7F2" }}
                >
                  Criar conta grátis
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#how"
                  className="inline-flex items-center justify-center gap-2 font-medium px-7 py-3.5 rounded-xl transition-all text-base"
                  style={{
                    border: "1px solid rgba(250,247,242,0.15)",
                    color: "#FAF7F2",
                  }}
                >
                  Como funciona
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>

              <p className="text-xs mt-5" style={{ color: "#9C8A70" }}>
                Grátis para sempre. Sem cartão de crédito.
              </p>
            </div>

            {/* Right: mock project card */}
            <div className="hidden md:flex justify-end pb-0">
              <div
                className="w-full max-w-sm rounded-t-2xl overflow-hidden"
                style={{
                  background: "#231810",
                  border: "1px solid rgba(192,139,42,0.2)",
                  borderBottom: "none",
                }}
              >
                {/* Card header */}
                <div
                  className="px-5 py-4 flex items-center justify-between"
                  style={{
                    borderBottom: "1px solid rgba(192,139,42,0.12)",
                  }}
                >
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: "#9C8A70" }}>
                      Projeto
                    </p>
                    <p className="font-semibold text-base" style={{ color: "#FAF7F2" }}>
                      Cozinha Sob Medida
                    </p>
                  </div>
                  <div
                    className="text-right px-3 py-1.5 rounded-lg"
                    style={{ background: "rgba(192,139,42,0.15)" }}
                  >
                    <p className="text-xs" style={{ color: "#9C8A70" }}>Total</p>
                    <p
                      className="font-bold text-lg"
                      style={{
                        fontFamily: "var(--font-fraunces), serif",
                        color: "#C08B2A",
                      }}
                    >
                      R$ 14.800
                    </p>
                  </div>
                </div>

                {/* Cost items */}
                <div className="px-5 py-3 space-y-2">
                  {[
                    { name: "MDF 18mm (10 chapas)", value: "R$ 3.200" },
                    { name: "Dobradiças Grass (24 un)", value: "R$ 840" },
                    { name: "Mão de obra montagem", value: "R$ 2.400" },
                    { name: "Ferragens e puxadores", value: "R$ 1.260" },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between py-2"
                      style={{ borderBottom: "1px solid rgba(250,247,242,0.05)" }}
                    >
                      <span className="text-sm" style={{ color: "#9C8A70" }}>
                        {item.name}
                      </span>
                      <span className="text-sm font-medium" style={{ color: "#FAF7F2" }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Status + share */}
                <div className="px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: "#C08B2A" }}
                    />
                    <span className="text-xs font-medium" style={{ color: "#9C8A70" }}>
                      Aguardando revisão
                    </span>
                  </div>
                  <button
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                    style={{ background: "rgba(192,139,42,0.2)", color: "#C08B2A" }}
                  >
                    <Share2 className="h-3 w-3" />
                    Compartilhar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────── */}
      <section
        className="py-8 px-5"
        style={{
          background: "#140E06",
          borderTop: "1px solid rgba(192,139,42,0.1)",
          borderBottom: "1px solid rgba(192,139,42,0.1)",
        }}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "Link público", label: "Para o cliente revisar" },
            { value: "WhatsApp", label: "Compartilhe em 1 clique" },
            { value: "PDF", label: "Export no plano Starter" },
            { value: "Grátis", label: "Para começar agora" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p
                className="text-xl font-bold mb-0.5"
                style={{
                  fontFamily: "var(--font-fraunces), serif",
                  color: "#C08B2A",
                }}
              >
                {item.value}
              </p>
              <p className="text-xs" style={{ color: "#9C8A70" }}>
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────── */}
      <section
        id="features"
        className="py-24 px-5"
        style={{ background: "#FAF7F2" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "#C08B2A" }}
            >
              Funcionalidades
            </p>
            <h2
              className="text-4xl md:text-5xl leading-tight max-w-xl"
              style={{
                fontFamily: "var(--font-fraunces), serif",
                color: "#1A1208",
              }}
            >
              Tudo que você precisa. Nada do que não usa.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: FolderOpen,
                title: "Projetos organizados",
                desc: "Cada cliente tem seus projetos separados. Fotos, descrição, data e histórico em um só lugar.",
              },
              {
                icon: TrendingUp,
                title: "Orçamento com margem",
                desc: "Calcule o custo dos materiais, aplique sua margem e veja o preço final automaticamente.",
              },
              {
                icon: Share2,
                title: "Link público por projeto",
                desc: "Compartilhe um link exclusivo com o cliente. Ele vê fotos e valor sem precisar de login.",
              },
              {
                icon: ClipboardList,
                title: "Revisão item a item",
                desc: "Envie o orçamento para revisão. O cliente aprova, recusa ou escolhe alternativas.",
              },
              {
                icon: ImageIcon,
                title: "Galeria de fotos e vídeos",
                desc: "Faça upload de imagens e vídeos do projeto. O cliente vê tudo pelo link público.",
              },
              {
                icon: Users,
                title: "Gestão de clientes",
                desc: "Cadastre clientes, vincule projetos e acesse todo o histórico de cada um rapidamente.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  borderTop: "3px solid #C08B2A",
                  border: "1px solid #E8DCC8",
                  borderTopWidth: "3px",
                  borderTopColor: "#C08B2A",
                }}
              >
                <div
                  className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-5"
                  style={{ background: "rgba(192,139,42,0.1)" }}
                >
                  <f.icon className="h-5 w-5" style={{ color: "#C08B2A" }} />
                </div>
                <h3
                  className="font-bold text-base mb-2"
                  style={{ color: "#1A1208" }}
                >
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#9C8A70" }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section id="how" className="py-24 px-5" style={{ background: "#1A1208" }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-16 text-center">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "#C08B2A" }}
            >
              Como funciona
            </p>
            <h2
              className="text-4xl md:text-5xl"
              style={{
                fontFamily: "var(--font-fraunces), serif",
                color: "#FAF7F2",
              }}
            >
              Em 4 passos, seu orçamento no celular do cliente.
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-0">
            {[
              {
                step: "01",
                title: "Crie o projeto",
                desc: "Adicione cliente, fotos, itens de custo com quantidade e preço unitário.",
              },
              {
                step: "02",
                title: "Defina a margem",
                desc: "Configure sua margem de lucro. O preço final é calculado automaticamente.",
              },
              {
                step: "03",
                title: "Compartilhe",
                desc: "Envie o link pelo WhatsApp. O cliente acessa sem cadastro.",
              },
              {
                step: "04",
                title: "Confirme",
                desc: "Cliente aprova ou contesta itens. Você confirma e o preço atualiza.",
              },
            ].map((s, i) => (
              <div key={s.step} className="relative">
                {i < 3 && (
                  <div
                    className="hidden md:block absolute top-8 right-0 w-1/2 h-px"
                    style={{ background: "rgba(192,139,42,0.25)", zIndex: 0 }}
                  />
                )}
                {i > 0 && (
                  <div
                    className="hidden md:block absolute top-8 left-0 w-1/2 h-px"
                    style={{ background: "rgba(192,139,42,0.25)", zIndex: 0 }}
                  />
                )}
                <div
                  className="px-6 py-8 relative text-center md:text-left"
                  style={{ zIndex: 1 }}
                >
                  <p
                    className="text-5xl font-bold mb-5 block"
                    style={{
                      fontFamily: "var(--font-fraunces), serif",
                      color: "rgba(192,139,42,0.3)",
                    }}
                  >
                    {s.step}
                  </p>
                  <p
                    className="font-semibold text-base mb-2"
                    style={{ color: "#FAF7F2" }}
                  >
                    {s.title}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "#9C8A70" }}>
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-5" style={{ background: "#FAF7F2" }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-16 text-center">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "#C08B2A" }}
            >
              Planos
            </p>
            <h2
              className="text-4xl md:text-5xl"
              style={{
                fontFamily: "var(--font-fraunces), serif",
                color: "#1A1208",
              }}
            >
              Simples. Transparente. Sem surpresa.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5 items-start">
            {/* Free */}
            <div
              className="rounded-2xl p-7"
              style={{
                background: "white",
                border: "1px solid #E8DCC8",
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-5"
                style={{ color: "#9C8A70" }}
              >
                Free
              </p>
              <div className="mb-6">
                <span
                  className="text-5xl font-bold"
                  style={{
                    fontFamily: "var(--font-fraunces), serif",
                    color: "#1A1208",
                  }}
                >
                  R$ 0
                </span>
                <p className="text-sm mt-1" style={{ color: "#9C8A70" }}>
                  Para sempre
                </p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "2 clientes",
                  "3 projetos ativos",
                  "3 fotos por projeto",
                  "1 revisão de orçamento",
                  "Link público por projeto",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: "#1A1208" }}>
                    <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "#2C5F3F" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block text-center w-full font-medium py-3 rounded-xl transition-all text-sm hover:opacity-80"
                style={{
                  border: "1px solid #E8DCC8",
                  color: "#1A1208",
                  background: "#F5F0E8",
                }}
              >
                Começar grátis
              </Link>
            </div>

            {/* Starter — featured */}
            <div
              className="rounded-2xl p-7 relative"
              style={{ background: "#1A1208" }}
            >
              <div
                className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap"
                style={{ background: "#C08B2A", color: "#FAF7F2" }}
              >
                Mais popular
              </div>
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-5"
                style={{ color: "#C08B2A" }}
              >
                Starter
              </p>
              <div className="mb-6">
                <span
                  className="text-5xl font-bold"
                  style={{
                    fontFamily: "var(--font-fraunces), serif",
                    color: "#FAF7F2",
                  }}
                >
                  R$ 49
                </span>
                <p className="text-sm mt-1" style={{ color: "#9C8A70" }}>
                  por mês
                </p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "15 clientes",
                  "30 projetos ativos",
                  "20 fotos por projeto",
                  "Revisões ilimitadas",
                  "PDF do orçamento",
                  "Dashboard financeiro",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: "#FAF7F2" }}>
                    <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "#C08B2A" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className="block text-center w-full font-semibold py-3 rounded-xl transition-all text-sm hover:opacity-90"
                style={{ background: "#C08B2A", color: "#FAF7F2" }}
              >
                Assinar Starter
              </Link>
            </div>

            {/* Pro */}
            <div
              className="rounded-2xl p-7"
              style={{
                background: "white",
                border: "1px solid #E8DCC8",
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-5"
                style={{ color: "#9C8A70" }}
              >
                Pro
              </p>
              <div className="mb-6">
                <span
                  className="text-5xl font-bold"
                  style={{
                    fontFamily: "var(--font-fraunces), serif",
                    color: "#1A1208",
                  }}
                >
                  R$ 129
                </span>
                <p className="text-sm mt-1" style={{ color: "#9C8A70" }}>
                  por mês
                </p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Clientes ilimitados",
                  "Projetos ilimitados",
                  "Uploads ilimitados",
                  "Tudo do Starter",
                  "Perfil público — seja encontrado",
                  "Pré-orçamento pelo perfil",
                  "Suporte prioritário",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm" style={{ color: "#1A1208" }}>
                    <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "#2C5F3F" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className="block text-center w-full font-medium py-3 rounded-xl transition-all text-sm hover:opacity-80"
                style={{
                  border: "1px solid #E8DCC8",
                  color: "#1A1208",
                  background: "#F5F0E8",
                }}
              >
                Assinar Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────────────────── */}
      <section
        className="py-20 px-5"
        style={{ background: "#C08B2A" }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2
            className="text-4xl md:text-5xl mb-4"
            style={{
              fontFamily: "var(--font-fraunces), serif",
              color: "#1A1208",
              fontStyle: "italic",
            }}
          >
            Pronto para organizar sua marcenaria?
          </h2>
          <p className="text-base mb-10 max-w-md mx-auto" style={{ color: "rgba(26,18,8,0.65)" }}>
            Crie sua conta grátis agora e comece a impressionar seus clientes
            com orçamentos que parecem profissionais — porque são.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 font-bold px-8 py-4 rounded-xl transition-all hover:opacity-90 text-base"
            style={{ background: "#1A1208", color: "#FAF7F2" }}
          >
            Criar conta grátis
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="text-xs mt-4" style={{ color: "rgba(26,18,8,0.5)" }}>
            Sem cartão de crédito. Plano grátis para sempre.
          </p>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer
        className="py-10 px-5"
        style={{ background: "#140E06" }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <span
            className="text-xl"
            style={{
              fontFamily: "var(--font-fraunces), serif",
              fontStyle: "italic",
              color: "#FAF7F2",
            }}
          >
            Projetta
          </span>
          <p className="text-xs" style={{ color: "#9C8A70" }}>
            © {new Date().getFullYear()} Projetta. Todos os direitos reservados.
          </p>
          <div className="flex gap-6 text-sm">
            {[
              { href: "/login", label: "Entrar" },
              { href: "/register", label: "Cadastrar" },
              { href: "/pricing", label: "Preços" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="transition-colors hover:text-[#FAF7F2]"
                style={{ color: "#9C8A70" }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
