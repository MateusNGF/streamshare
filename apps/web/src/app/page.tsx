import Link from "next/link";
import {
  Play,
  Users,
  TrendingUp,
  Shield,
  CheckCircle2,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-xl">
              <Play className="text-white fill-white" size={24} />
            </div>
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
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Gerencie suas{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-300">
                assinaturas
              </span>{" "}
              com facilidade
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-12 max-w-2xl mx-auto">
              Organize grupos, controle participantes e automatize cobranças de Netflix, Spotify e
              muito mais.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="px-8 py-4 bg-white text-primary font-bold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                Criar Conta Grátis
              </Link>
              <button className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all">
                Ver Demonstração
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="recursos" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Por que escolher o StreamShare?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Todas as ferramentas que você precisa para gerenciar suas assinaturas compartilhadas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100"
              >
                <div className="bg-primary/10 p-4 rounded-xl w-fit mb-4">
                  <feature.icon className="text-primary" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
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
            <p className="text-xl text-gray-600">Escolha o plano ideal para você</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Free",
                price: "Grátis",
                features: [
                  "Até 3 streamings",
                  "1 grupo",
                  "Sem automação",
                  "Suporte por email",
                ],
              },
              {
                name: "Basic",
                price: "R$ 9,90",
                highlight: true,
                features: [
                  "Até 5 streamings",
                  "Grupos ilimitados",
                  "Automação de cobranças",
                  "Suporte prioritário",
                  "Relatórios básicos",
                ],
              },
              {
                name: "Pro",
                price: "R$ 19,90",
                features: [
                  "Streamings ilimitados",
                  "Grupos ilimitados",
                  "Automação completa",
                  "Relatórios avançados",
                  "Suporte VIP 24/7",
                  "API de integração",
                ],
              },
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`bg-white p-8 rounded-2xl ${plan.highlight
                    ? "border-2 border-primary shadow-xl scale-105"
                    : "border border-gray-100 shadow-sm"
                  }`}
              >
                {plan.highlight && (
                  <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-bold">
                    Mais Econômico
                  </span>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mt-4 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.price !== "Grátis" && plan.price !== "Personalizado" && (
                    <span className="text-gray-600">/mês</span>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-600">
                      <CheckCircle2 className="text-primary" size={20} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`block text-center px-6 py-3 rounded-xl font-bold transition-all ${plan.highlight
                      ? "bg-primary hover:bg-accent text-white shadow-lg shadow-primary/25"
                      : "border-2 border-primary text-primary hover:bg-primary hover:text-white"
                    }`}
                >
                  Começar Agora
                </Link>
              </div>
            ))}
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
                a: "O StreamShare facilita a divisão de custos, mas não processa pagamentos diretamente. Você pode configurar cobranças e acompanhar quem já pagou.",
              },
              {
                q: "Posso cancelar a qualquer momento?",
                a: "Sim! Não há fidelidade. Você pode cancelar seu plano quando quiser sem custos adicionais.",
              },
              {
                q: "É seguro compartilhar credenciais?",
                a: "Todas as credenciais são criptografadas e apenas você tem acesso completo aos dados sensíveis.",
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary p-2 rounded-xl">
                  <Play className="text-white fill-white" size={20} />
                </div>
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
