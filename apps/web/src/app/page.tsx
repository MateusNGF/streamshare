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

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/assets/logo-branca.jpg"
              alt="StreamShare Logo"
              width={48}
              height={48}
              className="rounded-xl"
            />
            <span className="text-2xl font-bold text-gray-900">StreamShare</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#recursos" className="text-gray-600 hover:text-primary font-medium">
              Recursos
            </a>
            <a href="#planos" className="text-gray-600 hover:text-primary font-medium">
              Planos
            </a>
            <a href="#faq" className="text-gray-600 hover:text-primary font-medium">
              FAQ
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-6 py-2 text-gray-700 font-bold hover:text-primary transition-all"
            >
              Login
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 bg-primary hover:bg-accent text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all"
            >
              Começar Agora
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Urgency Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
              <Zap className="text-yellow-300" size={20} />
              <span className="font-semibold text-white">
                Junte-se aos early adopters que já estão economizando
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Economize até{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-green-300">
                80% em streaming
              </span>{" "}
              sem complicação
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Chega de pagar caro sozinho! Compartilhe Netflix, Spotify, Disney+ e mais
              com seus amigos e familiares. Organize grupos, automatize cobranças e
              nunca mais se preocupe com contas atrasadas.
            </p>

            {/* Value Props */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-10 text-purple-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-green-300" size={20} />
                <span>Sem taxa inicial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-green-300" size={20} />
                <span>Cancele quando quiser</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-green-300" size={20} />
                <span>100% seguro</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="group px-8 py-4 bg-white text-primary font-bold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all flex items-center gap-2"
              >
                Começar Grátis Agora
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              <button className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all">
                Ver Como Funciona
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
      <section className="py-16 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { num: "5 min", label: "Para Começar a Usar", icon: Clock },
              { num: "Até 80%", label: "De Economia Possível", icon: DollarSign },
              { num: "100%", label: "Automatizado", icon: Zap },
            ].map((stat, idx) => (
              <div key={idx} className="text-center text-white">
                <stat.icon className="mx-auto mb-3" size={40} />
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.num}</div>
                <div className="text-purple-100 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain Points & Solutions */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Conhece esses problemas?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Você não está sozinho. Milhares de pessoas enfrentam os mesmos desafios
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                problem: "Gastando muito com várias assinaturas",
                solution: "Divida custos e economize até 80%",
                icon: DollarSign,
              },
              {
                problem: "Amigos esquecem de pagar",
                solution: "Lembretes automáticos via WhatsApp",
                icon: Bell,
              },
              {
                problem: "Difícil controlar quem pagou",
                solution: "Dashboard completo em tempo real",
                icon: BarChart3,
              },
              {
                problem: "Muito trabalho manual",
                solution: "Automação total do processo",
                icon: Zap,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-red-50 p-3 rounded-xl">
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
      <section id="recursos" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Por que escolher o StreamShare?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Todas as ferramentas que você precisa para gerenciar suas assinaturas compartilhadas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Users,
                title: "Grupos Organizados",
                desc: "Crie e gerencie grupos de assinatura compartilhada de forma simples e eficiente.",
              },
              {
                icon: TrendingUp,
                title: "Controle Financeiro",
                desc: "Acompanhe pagamentos, inadimplência e receitas em tempo real com dashboards intuitivos.",
              },
              {
                icon: Shield,
                title: "Totalmente Seguro",
                desc: "Seus dados e informações de pagamento protegidos com criptografia de ponta.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-gray-50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100"
              >
                <div className="bg-primary/10 p-4 rounded-xl w-fit mb-4">
                  <feature.icon className="text-primary" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Additional Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Bell,
                title: "Lembretes Automáticos",
                desc: "Notificações por WhatsApp para cobranças pendentes",
              },
              {
                icon: Smartphone,
                title: "Acesso Mobile",
                desc: "Gerencie tudo pelo celular, tablet ou computador",
              },
              {
                icon: BarChart3,
                title: "Relatórios Detalhados",
                desc: "Análises completas de pagamentos e participação",
              },
              {
                icon: Zap,
                title: "Automação Total",
                desc: "Configure uma vez e deixe o sistema trabalhar por você",
              },
              {
                icon: Lock,
                title: "Dados Protegidos",
                desc: "Criptografia de nível bancário para suas informações",
              },
              {
                icon: HeartHandshake,
                title: "Suporte Dedicado",
                desc: "Time sempre pronto para ajudar quando precisar",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl hover:bg-white hover:shadow-md transition-all border border-gray-100"
              >
                <div className="bg-primary/10 p-3 rounded-lg">
                  <feature.icon className="text-primary" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Como Funciona</h2>
            <p className="text-xl text-gray-600">Simples e rápido em 3 passos</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { num: "1", title: "Crie sua Conta", desc: "Cadastre-se gratuitamente em minutos" },
              {
                num: "2",
                title: "Adicione Streamings",
                desc: "Configure suas assinaturas e defina vagas",
              },
              {
                num: "3",
                title: "Convide Participantes",
                desc: "Compartilhe e gerencie cobranças automaticamente",
              },
            ].map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="planos" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Planos e Preços</h2>
            <p className="text-xl text-gray-600 mb-4">Escolha o plano ideal para você</p>
            <div className="inline-flex items-center gap-2 bg-green-100 px-6 py-3 rounded-full">
              <Award className="text-green-600" size={20} />
              <span className="text-green-700 font-semibold">
                Garantia de reembolso em 7 dias
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Free",
                price: "Grátis",
                period: "",
                savings: "",
                features: [
                  "1 streaming",
                  "Até 5 participantes no total",
                  "Controle manual de cobranças",
                  "Dashboard básico",
                  "Visualização de relatórios",
                  "Suporte por email",
                ],
              },
              {
                name: "Pro",
                price: "R$ 9,90",
                period: "/mês",
                savings: "Economize R$ 118,80/ano no plano anual",
                highlight: true,
                badge: "🔥 Recomendado",
                features: [
                  "Streamings ilimitados",
                  "Participantes ilimitados",
                  "Automação de cobranças via WhatsApp",
                  "Lembretes automáticos",
                  "Dashboard completo e em tempo real",
                  "Relatórios detalhados",
                  "Controle de inadimplência",
                  "Notificações inteligentes",
                  "Suporte prioritário",
                ],
              },
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`bg-white p-8 rounded-2xl relative ${plan.highlight
                  ? "border-2 border-primary shadow-xl scale-105 transform"
                  : "border border-gray-100 shadow-sm"
                  }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg whitespace-nowrap">
                      {plan.badge}
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mt-4 mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && <span className="text-gray-600 text-xl">{plan.period}</span>}
                </div>
                {plan.savings && (
                  <div className="text-green-600 font-semibold text-sm mb-6">{plan.savings}</div>
                )}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-600">
                      <CheckCircle2 className="text-primary flex-shrink-0 mt-1" size={18} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`block text-center px-6 py-4 rounded-xl font-bold transition-all ${plan.highlight
                    ? "bg-primary hover:bg-accent text-white shadow-lg shadow-primary/25"
                    : "border-2 border-primary text-primary hover:bg-primary hover:text-white"
                    }`}
                >
                  {plan.name === "Free" ? "Começar Grátis" : "Assinar Agora"}
                </Link>
                {plan.highlight && (
                  <p className="text-center text-xs text-gray-500 mt-3">
                    Cancele quando quiser • Sem fidelidade
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Comparison note */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 max-w-2xl mx-auto">
              💡 <strong>Dica:</strong> Dividindo uma Netflix Premium (R$ 55,90) entre 4 pessoas, você paga apenas <strong>R$ 13,98/pessoa</strong>. O plano Pro se paga com apenas 1 streaming compartilhado!
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Detail */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simples de Usar
            </h2>
            <p className="text-xl text-gray-600">
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
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "Como funciona o pagamento?",
                a: "O StreamShare organiza e rastreia as cobranças, mas não processa pagamentos diretamente. Os participantes pagam via PIX, transferência ou outro método combinado entre vocês.",
              },
              {
                q: "Quanto eu posso economizar?",
                a: "Em média, nossos usuários economizam entre 60% a 80% nos custos de streaming. Por exemplo, uma Netflix Premium de R$ 55,90 dividida entre 4 pessoas sai por apenas R$ 13,98 por pessoa!",
              },
              {
                q: "Posso cancelar a qualquer momento?",
                a: "Sim! Não há fidelidade. Você pode cancelar seu plano Pro quando quiser sem custos adicionais. O plano Free é sempre gratuito.",
              },
              {
                q: "Meus dados estão seguros?",
                a: "Sim! Todas as informações são armazenadas de forma segura e criptografada. Nunca compartilhamos seus dados com terceiros. Você decide quais informações seus participantes podem ver.",
              },
              {
                q: "Como funcionam os lembretes automáticos?",
                a: "O sistema envia mensagens automáticas via WhatsApp para os participantes antes da data de vencimento, lembrando sobre o pagamento. Você pode personalizar a frequência e o texto das mensagens.",
              },
              {
                q: "Funciona com qualquer plataforma de streaming?",
                a: "Sim! Funciona com Netflix, Spotify, Disney+, HBO Max, Amazon Prime, YouTube Premium e qualquer outra plataforma de assinatura que você queira compartilhar.",
              },
              {
                q: "E se alguém não pagar?",
                a: "Você recebe notificações em tempo real sobre pagamentos pendentes. O sistema marca automaticamente inadimplentes e você pode gerar relatórios completos para acompanhar a situação de cada participante.",
              },
            ].map((faq, idx) => (
              <details
                key={idx}
                className="bg-gray-50 p-6 rounded-xl border border-gray-100 group"
              >
                <summary className="font-bold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-primary">+</span>
                </summary>
                <p className="mt-4 text-gray-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-primary via-purple-600 to-indigo-700 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Pronto para economizar de verdade?
            </h2>
            <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Comece gratuitamente agora e economize até 80% nos seus streamings favoritos.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link
                href="/login"
                className="group px-10 py-5 bg-white text-primary font-bold text-lg rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all flex items-center gap-2"
              >
                Começar Agora - É Grátis
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
      <footer className="bg-gray-900 text-white py-12">
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
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Sobre
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#faq" className="hover:text-white">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contato
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm">
              © 2026 StreamShare. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
