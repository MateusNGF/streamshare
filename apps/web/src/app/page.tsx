import Link from "next/link";
import { Play, Users, TrendingUp, Shield, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-accent to-purple-600">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-white rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-xl">
            <Play className="text-primary fill-primary" size={28} />
          </div>
          <span className="text-2xl font-bold text-white">StreamShare</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-6 py-3 text-white font-bold hover:bg-white/10 rounded-xl transition-all"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="px-6 py-3 bg-white text-primary font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Criar conta
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Gerencie suas{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200">
              assinaturas compartilhadas
            </span>{" "}
            com facilidade
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto">
            Organize grupos, controle participantes e automatize cobranças de Netflix, Spotify e
            muito mais.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/cadastro"
              className="flex items-center gap-2 px-8 py-4 bg-white text-primary font-bold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all"
            >
              Começar agora
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 border-2 border-white text-white font-bold rounded-2xl hover:bg-white/10 transition-all"
            >
              Já tenho conta
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/20">
            <div className="bg-white/20 p-4 rounded-2xl w-fit mb-4">
              <Users className="text-white" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Grupos Organizados</h3>
            <p className="text-white/80">
              Crie e gerencie grupos de assinatura compartilhada de forma simples e eficiente.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/20">
            <div className="bg-white/20 p-4 rounded-2xl w-fit mb-4">
              <TrendingUp className="text-white" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Controle Financeiro</h3>
            <p className="text-white/80">
              Acompanhe pagamentos, inadimplência e receitas em tempo real com dashboards
              intuitivos.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/20">
            <div className="bg-white/20 p-4 rounded-2xl w-fit mb-4">
              <Shield className="text-white" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Totalmente Seguro</h3>
            <p className="text-white/80">
              Seus dados e informações de pagamento protegidos com criptografia de ponta.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
