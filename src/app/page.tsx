import Link from "next/link";
import Image from "next/image";
import {
  Users,
  TrendingUp,
  Shield,
  CheckCircle2,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowRight,
  Star,
  DollarSign,
  Clock,
  Zap,
  Award,
  Lock,
  BarChart3,
  Bell,
  Smartphone,
  HeartHandshake,
} from "lucide-react";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { PlansClient } from "@/components/planos/PlansClient";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { InteractiveBackground } from "@/components/landing/InteractiveBackground";

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

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Navbar */}
      <LandingNavbar session={session} />

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-32 pb-12 md:pb-20 bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900 text-white overflow-hidden">
        {/* Interactive Background */}
        <InteractiveBackground />

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
                href={session ? "/dashboard" : "/login"}
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


      {/* Stats - Social Proof */}


      {/* Pain Points & Solutions */}
      <section className="py-12 md:py-20 bg-gray-50">
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
              },
              {
                problem: "A Planilha do Caos",
                solution: "Painel Visual em Tempo Real",
                icon: BarChart3,
              },
              {
                problem: "Prejuízo Invisível (Pagar 4 Telas e Usar 1)",
                solution: "Economia Real de até 80%",
                icon: TrendingUp,
              },
              {
                problem: "Perda de Tempo com PIX Manual",
                solution: "Gestão Financeira Descomplicada",
                icon: Zap,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-red-50 p-3 rounded-xl transition-transform hover:scale-110 duration-300">
                    <item.icon className="text-red-500" size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="text-red-600 font-semibold mb-2 line-through">
                      ❌ {item.problem}
                    </div>
                    <div className="text-green-600 font-bold flex items-center gap-2">
                      ✅ {item.solution}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="recursos" className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Por que escolher o StreamShare?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Todas as ferramentas que você precisa para gerenciar suas assinaturas compartilhadas
            </p>
          </div>

          <div className="flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-visible gap-6 md:gap-8 mb-16 pb-4 md:pb-0 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-auto md:px-0">
            {[
              {
                icon: HeartHandshake,
                title: 'Cobrança sem "Climão"',
                desc: "O sistema cobra seus amigos automaticamente. Você não precisa mais ser o 'chato' que fica pedindo dinheiro no grupo.",
              },
              {
                icon: Shield,
                title: "Fim do Calote",
                desc: "Reduza a inadimplência a zero. Com lembretes programados, ninguém mais 'esquece' de pagar a parte dele.",
              },
              {
                icon: TrendingUp,
                title: "Lucro no Piloto Automático",
                desc: "Visualize sua economia crescendo enquanto o sistema gerencia tudo sozinho. O dinheiro cai na conta, sem esforço.",
              },
              {
                icon: Lock,
                title: "Blindagem de Dados",
                desc: "Segurança de nível bancário. Seus dados financeiros e de seus amigos são protegidos com criptografia de ponta.",
              },
              {
                icon: Zap,
                title: "Organização em 1 Clique",
                desc: "Painel intuitivo para gerenciar Netflix, Spotify e outros em um só lugar. Adeus planilhas confusas e anotações perdidas.",
              },
              {
                icon: Bell,
                title: "Notificações que Funcionam",
                desc: "Lembretes enviados onde as pessoas realmente vêem: no WhatsApp. Aumente a taxa de pagamento em até 90%.",
              },
              {
                icon: Smartphone,
                title: "Controle na Palma da Mão",
                desc: "Acesse de qualquer lugar. Seu painel de controle otimizado para celular, tablet ou computador.",
              },
              {
                icon: BarChart3,
                title: "Transparência Total",
                desc: "Histórico detalhado de quem pagou e quem deve. Acabe com as dúvidas e o 'disse-que-me-disse' nos grupos.",
              },
              {
                icon: Award,
                title: "Suporte Especializado",
                desc: "Dúvidas na configuração? Nosso time de especialistas te ajuda a começar em menos de 5 minutos.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="min-w-[85vw] md:min-w-0 snap-center bg-gray-50 p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 group"
              >
                <div className="bg-primary/10 p-4 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="text-primary" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Additional Features Grid */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[

            ].map((feature, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-100 group"
              >
                <div className="bg-primary/10 p-3 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="text-primary" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div> */}
        </div>
      </section>

      {/* How It Works */}
      <section id="como-funciona" className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Como Funciona</h2>
            <p className="text-lg md:text-xl text-gray-600">Não é trabalho, é mágica. Comece em segundos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { num: "1", title: "Cadastro Relâmpago", desc: "Crie sua conta em menos de 30 segundos." },
              {
                num: "2",
                title: "Setup Inteligente",
                desc: "Defina o valor e deixe o sistema organizar os grupos para você.",
              },
              {
                num: "3",
                title: "Pix Automático",
                desc: "O sistema cobra e o dinheiro cai na sua conta. Simples assim.",
              },
            ].map((step, idx) => (
              <div key={idx} className="text-center group">
                <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Detail */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Simples de Usar
            </h2>
            <p className="text-lg md:text-xl text-gray-600">
              Configure uma vez e deixe o sistema trabalhar por você
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="bg-primary/10 p-3 rounded-xl h-fit">
                  <Users className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Cadastre Streamings</h3>
                  <p className="text-gray-600">Adicione Netflix, Spotify, Disney+ ou qualquer outro serviço que você compartilha</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-primary/10 p-3 rounded-xl h-fit">
                  <Bell className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Adicione Participantes</h3>
                  <p className="text-gray-600">Convide amigos e familiares, defina valores e datas de cobrança</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="bg-primary/10 p-3 rounded-xl h-fit">
                  <Zap className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Deixe o Sistema Trabalhar</h3>
                  <p className="text-gray-600">Lembretes automáticos via WhatsApp, controle de pagamentos e relatórios em tempo real</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-primary/10 p-3 rounded-xl h-fit">
                  <BarChart3 className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Acompanhe Tudo</h3>
                  <p className="text-gray-600">Dashboard completo mostra quem pagou, quem está devendo e suas economias totais</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* Pricing */}
      <section id="planos" className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-6">


          <div className="max-w-6xl mx-auto">
            <PlansClient isLoggedIn={!!session} currentPlan={account?.conta.plano || "basico"} />
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
                href={session ? "/dashboard" : "/login"}
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
      </section >

      {/* Footer */}
      < footer className="bg-gray-900 text-white py-12" >
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Image
                  src="/assets/logo-branca.jpg"
                  alt="StreamShare"
                  width={40}
                  height={40}
                  className="rounded-xl"
                />
                <span className="text-xl font-bold">StreamShare</span>
              </div>
              <p className="text-gray-400">Gestão inteligente de assinaturas compartilhadas</p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#recursos" className="hover:text-white">
                    Recursos
                  </a>
                </li>
                <li>
                  <a href="#planos" className="hover:text-white">
                    Planos
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-white">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/termos-de-uso" className="hover:text-white">
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link href="/politica-de-privacidade" className="hover:text-white">
                    Política de Privacidade
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#faq" className="hover:text-white">
                    Central de Ajuda
                  </a>
                </li>
                <li>
                  <a href="mailto:contato@streamshare.com.br" className="hover:text-white">
                    Contato
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-gray-400 text-sm">
                © 2026 StreamShare. Todos os direitos reservados.
              </p>
              <p className="text-gray-500 text-[10px] max-w-md">
                O StreamShare é uma plataforma independente e não possui vínculo oficial com os serviços de streaming mencionados. As marcas são propriedade de seus respectivos donos.
              </p>
            </div>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>
      </footer >
    </div >
  );
}
