import { cache } from "react";
import Link from "next/link";
import {
  Users,
  TrendingUp,
  Shield,
  CheckCircle2, ArrowRight,
  Star,
  DollarSign,
  Zap,
  Award,
  BarChart3,
  Bell
} from "lucide-react";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { PlansClient } from "@/components/planos/PlansClient";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { SystemShowcase } from "@/components/landing/SystemShowcase";
import { StreamingMarquee } from "@/components/landing/StreamingMarquee";
import { Footer } from "@/components/layout/Footer";
import { InteractiveMesh } from "@/components/backgrounds/InteractiveMesh";
import { FeatureStepsCarousel } from "@/components/landing/FeatureStepsCarousel";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "StreamShare | Economize até 80% em Streaming",
  description: "Pare de pagar o valor integral. Divida e gerencie Streaming de forma segura e automática. Junte-se milhares de pessoas economizando todo mês com o StreamShare.",
  openGraph: {
    title: "Economize até 80% em Streaming | StreamShare",
    description: "Pare de pagar o valor integral. Divida e gerencie Streaming de forma segura e automática. Junte-se milhares de pessoas economizando todo mês.",
    url: "https://streamshare.com.br",
    type: "website",
  },
};

export default async function LandingPage() {
  const session = await getCurrentUser();
  let account = null;

  if (session) {
    account = await prisma.contaUsuario.findFirst({
      where: { usuarioId: session.userId, isAtivo: true },
      include: {
        conta: {
          select: {
            plano: true
          }
        }
      }
    });
  }

  // Fetch active services from the catalog for the marquee (Cached)
  const getCatalogServices = cache(async () => {
    return prisma.streamingCatalogo.findMany({
      where: { isAtivo: true },
      select: {
        nome: true,
        corPrimaria: true,
        iconeUrl: true,
      },
      orderBy: { nome: "asc" }
    });
  });

  const catalogServices = await getCatalogServices();

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Navbar */}
      <LandingNavbar session={session} />

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-32 pb-8 md:pb-12 bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900 text-white overflow-hidden">
        {/* Interactive Mesh */}
        <InteractiveMesh />

        <div className="relative z-10 container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Urgency Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6 animate-fade-in">
              <Zap className="text-yellow-300 animate-pulse" size={20} />
              <span className="font-semibold text-white">
                Junte-se aos early adopters que já estão economizando
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight animate-slide-in-from-bottom stagger-1">
              Dê um Basta no <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-green-300">
                Desperdício das Suas Assinaturas
              </span>
            </h1>
            <p className="text-lg md:text-2xl text-purple-100 mb-6 md:mb-8 max-w-2xl mx-auto animate-slide-in-from-bottom stagger-2">
              Você já paga por Netflix, Spotify e outros. Por que não dividir a conta e colocar
              <span className="font-bold text-white"> R$ 2.000,00/ano</span> de volta no seu bolso?
            </p>

            {/* Value Props */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-10 text-purple-100 animate-fade-in stagger-3">
              <div className="flex items-center gap-2 transition-transform hover:scale-110 duration-300">
                <CheckCircle2 className="text-green-300" size={20} />
                <span>Sem taxa inicial</span>
              </div>
              <div className="flex items-center gap-2 transition-transform hover:scale-110 duration-300">
                <CheckCircle2 className="text-green-300" size={20} />
                <span>Cancele quando quiser</span>
              </div>
              <div className="flex items-center gap-2 transition-transform hover:scale-110 duration-300">
                <CheckCircle2 className="text-green-300" size={20} />
                <span>100% seguro</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in stagger-4">
              <Link
                href={session ? "/dashboard" : "/login?mode=signup"}
                className="group w-full sm:w-auto px-8 py-4 bg-white text-primary font-bold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
                {session ? "Acessar Meu Painel" : "Começar Grátis Agora"}
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 hover:scale-105 transition-all duration-300">
                <a href="#como-funciona">Ver Como Funciona</a>
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-purple-200">
              <div className="flex items-center gap-2">
                <Shield size={18} />
                <span>Dados criptografados</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={18} />
                <span>Plano Free disponível</span>
              </div>
              <div className="flex items-center gap-2">
                <Star size={18} className="fill-yellow-300 text-yellow-300" />
                <span>Bem avaliado por usuários</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / Integrations Marquee (Agnóstico e Dinâmico) */}
      <div className="space-y-0">
        <StreamingMarquee
          items={[...catalogServices].reverse()}
          variant="compact"
          speed="fast"
          pauseOnHover={true}
        />
      </div>



      {/* Pain Points & Solutions */}
      <section className="py-12 md:py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Paz Mental ou Caos Financeiro?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Veja a diferença entre gerenciar sozinho e usar o StreamShare
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                problem: "O 'Amigo' Esquecido",
                solution: "Cobrança Automática sem Chateação",
                icon: DollarSign,
                color: "red"
              },
              {
                problem: "A Planilha do Caos",
                solution: "Painel Visual em Tempo Real",
                icon: BarChart3,
                color: "orange"
              },
              {
                problem: "Prejuízo Invisível (Pagar 4 Telas e Usar 1)",
                solution: "Economia Real de até 80%",
                icon: TrendingUp,
                color: "amber"
              },
              {
                problem: "Perda de Tempo com PIX Manual",
                solution: "Gestão Financeira Descomplicada",
                icon: Zap,
                color: "blue"
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-gray-50 p-8 rounded-3xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-2xl shadow-sm">
                    <item.icon className="text-primary" size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-400 font-medium mb-2 line-through text-sm">
                      {item.problem}
                    </div>
                    <div className="text-gray-900 font-bold text-lg flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-green-500" />
                      {item.solution}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase do Sistema (Novo) */}
      <section className="py-16 md:py-24 bg-white overflow-hidden relative">
        <div className="container mx-auto px-6">
          <SystemShowcase
            badge="✨ Por dentro do StreamShare"
            items={[
              {
                id: 1,
                src: "/assets/banners/painel_organizador.jpg",
                title: "Dashboard Intuitivo",
                desc: "Acompanhe suas economias e pendências em tempo real."
              },
              {
                id: 2,
                src: "/assets/banners/participante_view.jpg",
                title: "Visão do Participante",
                desc: "Seus membros têm um painel exclusivo para gerenciar faturas e acessos."
              },
              {
                id: 3,
                src: "/assets/banners/cobranças_organizador.jpg",
                title: "Gestão Financeira",
                desc: "Controle quem pagou e quem está devendo com um clique."
              },
              {
                id: 4,
                src: "/assets/banners/assinatuas_organizador.jpg",
                title: "Suas Assinaturas",
                desc: "Centralize Netflix, Spotify e outros em um só lugar."
              }
            ]}
          />
        </div>
      </section>

      {/* How It Works Carousel */}
      <FeatureStepsCarousel
        id="como-funciona"
        title="Como Funciona"
        description="Deslize para o lado para ver o passo a passo de como economizar."
        items={[
          {
            id: 1,
            title: 'Cadastro Relâmpago',
            description: 'Crie sua conta em segundos e conecte seus serviços favoritos.',
          },
          {
            id: 2,
            title: 'Setup Inteligente',
            description: 'Defina o valor e deixe o sistema organizar os grupos para você.',
          },
          {
            id: 3,
            title: 'Tudo Automático',
            description: 'O sistema cobra, o dinheiro cai na sua conta sem dor de cabeça.',
          },
          {
            id: 4,
            title: 'Gestão de Membros',
            description: 'Convide, remova ou substitua pessoas do seu grupo com apenas um clique.',
          },
          {
            id: 5,
            title: 'Saque Imediato',
            description: 'Transfira seu saldo para sua conta bancária via PIX a qualquer momento.',
          }
        ]}
      />

      {/* Bento Grid Simples - Benefícios Extras */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Card Grande (2 colunas) */}
            <div className="md:col-span-2 bg-gradient-to-br from-gray-50 to-gray-100 p-8 md:p-12 rounded-3xl border border-gray-200 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Shield size={28} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Segurança Nível Bancário</h3>
              <p className="text-lg text-gray-600 leading-relaxed">Não tocamos no seu dinheiro. O StreamShare organiza, notifica e facilita, mas o PIX cai direto na sua conta, com criptografia de ponta em todos os dados.</p>
            </div>

            {/* Card Pequeno */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-3xl border border-indigo-100/50 hover:shadow-lg transition-all group">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Bell size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Cobrança via WhatsApp</h3>
              <p className="text-gray-600 leading-relaxed">Lembretes amigáveis direto no Zap. Chega de climão cobrando amigos ou familiares no almoço de domingo.</p>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="planos" className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-6">


          <div className="max-w-6xl mx-auto">
            <PlansClient isLoggedIn={!!session} currentPlan={account?.conta.plano || "free"} />
          </div>

          {/* Comparison note */}
          <div className="mt-8 md:mt-12 text-center">
            <p className="text-gray-600 max-w-2xl mx-auto">
              💡 <strong>Dica:</strong> Dividindo uma Netflix Premium (R$ 55,90) entre 4 pessoas, você paga apenas <strong>R$ 13,98/pessoa</strong>. O plano Pro se paga com apenas 1 streaming compartilhado!
            </p>
          </div>
        </div>
      </section>



      {/* FAQ */}
      < section id="faq" className="py-12 md:py-20 bg-white" >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "É realmente seguro?",
                a: "Absolutamente. Utilizamos criptografia de ponta e não tocamos no seu dinheiro. O StreamShare é uma ferramenta de gestão, os pagamentos são feitos diretamente para você.",
              },
              {
                q: "E se meus amigos não pagarem?",
                a: "O sistema é o 'policial mau' por você. Ele envia lembretes automáticos e marca inadimplentes, reduzindo o constrangimento e a falta de pagamento.",
              },
              {
                q: "Preciso cadastrar cartão de crédito?",
                a: "Não! Você pode começar com o plano Gratuito sem informar cartão de crédito. Só pediremos dados de pagamento se você decidir fazer o upgrade para o Pro.",
              },
              {
                q: "Funciona para dividir contas de casa?",
                a: "Sim! Embora focado em streaming, você pode criar grupos personalizados para dividir internet, aluguel ou qualquer conta recorrente.",
              },
              {
                q: "Posso cancelar se não gostar?",
                a: "A qualquer momento, com um clique. Sem letras miúdas, sem fidelidade e sem dor de cabeça.",
              },
            ].map((faq, idx) => (
              <details
                key={idx}
                className="bg-gray-50 p-6 rounded-xl border border-gray-100 group hover:shadow-md transition-all duration-300"
              >
                <summary className="font-bold text-gray-900 cursor-pointer list-none flex items-center justify-between group-hover:text-primary transition-colors">
                  {faq.q}
                  <span className="text-primary text-2xl group-open:rotate-45 transition-transform duration-300">+</span>
                </summary>
                <p className="mt-4 text-gray-600 animate-fade-in">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section >

      {/* Final CTA */}
      < section className="py-16 md:py-24 bg-gradient-to-br from-primary via-purple-600 to-indigo-700 text-white" >
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-6xl font-bold mb-6">
              Não Deixe Dinheiro na Mesa
            </h2>
            <p className="text-lg md:text-2xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Cada dia sem o StreamShare é um dia perdendo dinheiro. Comece agora.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link
                href={session ? "/dashboard" : "/login?mode=signup"}
                className="group px-10 py-5 bg-white text-primary font-bold text-lg rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
              >
                {session ? "Ir para o Painel" : "Começar Agora - É Grátis"}
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={24} />
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 text-purple-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-green-300" size={20} />
                <span>Não precisa cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-green-300" size={20} />
                <span>Configure em menos de 5 minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-green-300" size={20} />
                <span>Cancele quando quiser</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
