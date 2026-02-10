"use client";

import { CheckCircle2, Server, Database, Bell, Shield, ArrowRight, Zap, RefreshCw, ChevronLeft } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import Link from "next/link";
import Image from "next/image";

interface StatusPageClientProps {
    session: any;
}

const statusItems = [
    {
        name: "Banco de Dados",
        status: "Operacional",
        icon: Database,
        color: "text-green-500",
        bgColor: "bg-green-50",
    },
    {
        name: "API de Pagamentos",
        status: "Operacional",
        icon: Zap,
        color: "text-green-500",
        bgColor: "bg-green-50",
    },
    {
        name: "Sistema de Notificações",
        status: "Operacional",
        icon: Bell,
        color: "text-green-500",
        bgColor: "bg-green-50",
    },
    {
        name: "Infraestrutura Principal",
        status: "Operacional",
        icon: Server,
        color: "text-green-500",
        bgColor: "bg-green-50",
    },
];

const changelogData = [
    {
        date: "10/02/2026",
        changes: [
            { category: "Navegação", description: "Adição de botão 'Voltar para Home' na página de Status para facilitar a transição entre áreas informativas e promocionais." },
            { category: "Interface", description: "Padronização do rodapé institucional através de novo componente Footer compartilhado entre Landing Page e Status Page." },
            { category: "Arquitetura", description: "Integração de variáveis de ambiente (NEXT_PUBLIC_URL) em links globais para garantir roteamento absoluto consistente em toda a plataforma." },
            { category: "Fluxo", description: "Otimização de conversão na Landing Page: botões 'Começar Agora' agora redirecionam dinamicamente para a aba de cadastro direto via query parameters (?mode=signup)." },
            { category: "Interface", description: "Lançamento da central de Status e Histórico de Atualizações (StatusPageClient) com monitoramento visual de disponibilidade e timeline de progresso técnico." },
            { category: "Navegação", description: "Refatoração de arquitetura nos Sidebars (User/Admin) e LandingNavbar: Logotipos agora encapsulados em componentes Next/Link para navegação root instantânea." },
            { category: "UX", description: "Padronização de interatividade em CTAs: aplicação de classes cursor-pointer e micro-interações de zoom/rotação via Framer Motion e Tailwind para melhor feedback tátil." },
            { category: "Mobile", description: "Otimização de viewport em diálogos modais e menus laterais: redução de paddings internos e ajuste de Z-Index para evitar sobreposição em telas menores que 640px." },
            { category: "Formalização", description: "Auditoria e revisão integral de copy: transição para um tom profissional e técnico (Padrão SaaS B2B) em toda a interface de faturamento e configurações." },
        ],
    },
    {
        date: "07/02/2026",
        changes: [
            { category: "Configurações", description: "Expansão da entidade PerfilAdministrador com a inclusão de campos para integração via API do WhatsApp em fluxos de notificação." },
            { category: "Finanças", description: "Implementação de lógica para Chaves PIX persistentes; integração automática com o gerador de templates de renovação de grupos em formato SVG/PDF." },
            { category: "Interface", description: "Refatoração completa do Billing Board utilizando CSS Grid e Flexbox, melhorando a escalabilidade visual de dados financeiros complexos." },
            { category: "Funcionalidade", description: "Novo endpoint e interface para cancelamento assíncrono de cobranças pendentes, com atualização de estado em tempo real no banco de dados." },
            { category: "UX", description: "Implementação de Modais Base de confirmação utilizando Portals; diálogos dinâmicos com suporte a estados de carregamento e mensagens de erro específicas." },
            { category: "Sistema", description: "Desenvolvimento do módulo de Auditoria Centralizada (AuditLogs) para rastreio persistente de notificações enviadas e alterações críticas de configuração." },
            { category: "Segurança", description: "Refatoração de transações críticas de banco de dados para garantir conformidade ACID total e prevenção contra Race Conditions em operações financeiras." },
        ],
    },
    {
        date: "06/02/2026",
        changes: [
            { category: "Regras", description: "Atualização de schema: Campo WhatsApp passa a ser opcional (nullable), permitindo fluxos flexíveis de onboarding para novos participantes." },
            { category: "Interface", description: "Ajustes de layout no AdminSidebar: correção de responsividade e alinhamento de itens de menu utilizando componentes personalizados de hover." },
            { category: "Negócio", description: "Pivotagem técnica na lógica de Assinaturas: remoção da restrição de UID duplicado por grupo, habilitando a aquisição de múltiplas cotas pelo mesmo usuário." },
            { category: "Fluxo", description: "Adição de seletor numérico (Counter component) no workflow de assinaturas para otimizar o processamento de compras em lote (Bulk)." },
        ],
    },
    {
        date: "05/02/2026",
        changes: [
            { category: "Mobile", description: "Refatoração estrutural da LandingNavbar para dispositivos móveis: implementação de menu hambúrguer com animação e controle de foco (A11y)." },
            { category: "Design", description: "Migração para novo sistema de ativos SVG otimizados: redução de 40% no bundle visual da página inicial através da vetorização de ícones." },
            { category: "UX", description: "Limpeza da Dashboard: análise de uso e remoção de botões de ações rápidas legados para melhorar a densidade de informação útil." },
        ],
    },
    {
        date: "04/02/2026",
        changes: [
            { category: "Correção", description: "Resolução de bug lógico na validação de CPF: agora é permitido o cadastro de participantes sem CPF quando vinculados como dependentes." },
            { category: "Feedback", description: "Melhoria no tratador de exceções (Error boundary): mensagens descritivas ao tentar remover participantes que possuam chaves estrangeiras (assinaturas) ativas." },
            { category: "Funcionalidade", description: "Implementação de Multi-Select (checkbox list) no quarto passo do fluxo de criação de assinaturas para atribuição em massa." },
            { category: "Copywriting", description: "Revisão e padronização semântica das notificações de reajuste tarifário, garantindo conformidade com regras de negócios de streaming." },
            { category: "Core", description: "Migração dos componentes de Select nativos para Radix UI; solução definitiva para problemas de estouro de Z-Index e acessibilidade de teclado." },
            { category: "Visual", description: "Redesign integral das views de Autenticação (Login/Recovery) focando em conversão e experiência 'clean' (Inter Typeface)." },
            { category: "Internacionalização", description: "Início do sistema multi-moeda (L10n): suporte inicial para ARS, BOB, PYG, UYU e BRL com formatação dinâmica de locales." },
            { category: "Fix", description: "Resolução de inconsistências persistentes no Logoff Modal através de encapsulamento com React Portals no nível do DOM root." },
            { category: "Painel", description: "Otimização da arquitetura de informação na aba de parâmetros operacionais: agrupamento lógico de configurações relacionadas." },
            { category: "Responsividade", description: "Ajuste na renderização de serviços selecionados (Stack view) para evitar quebra de layout em viewports inferiores a 375px." },
        ],
    },
];

function BackButton() {
    return (
        <div className="absolute top-24 left-4 md:top-28 md:left-8 z-30">
            <Link
                href="/"
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group p-2"
            >
                <div className="p-2 rounded-xl bg-white/10 border border-white/10 group-hover:border-white/30 transition-all backdrop-blur-md">
                    <ChevronLeft size={20} />
                </div>
                <span className="font-medium hidden md:inline text-sm">Voltar para home</span>
            </Link>
        </div>
    );
}

export function StatusPageClient({ session }: StatusPageClientProps) {
    return (
        <div className="min-h-screen  w-full bg-white font-inter relative">

            <LandingNavbar session={session} />
            <BackButton />

            {/* Hero Section */}
            <section className="relative pt-24 pb-12 md:pt-32 md:pb-16 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] text-white">
                <div className="container mx-auto px-3 md:px-6 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-white/10">
                            <RefreshCw className="text-green-400 animate-spin-slow" size={16} />
                            <span className="text-sm font-medium">Monitoramento em tempo real</span>
                        </div>
                        <h1 className="text-3xl md:text-6xl font-bold mb-4 md:mb-6 tracking-tight">
                            Status do Sistema <br />
                            <span className="text-purple-400">& Changelog</span>
                        </h1>
                        <p className="text-base md:text-xl text-gray-300 max-w-2xl mx-auto">
                            Acompanhe a disponibilidade de nossos serviços e explore as evoluções contínuas da plataforma.
                        </p>
                    </div>
                </div>

                {/* Decorative background element */}
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent"></div>
            </section>

            {/* Status Section */}
            <section className="py-8 md:py-12 -mt-10 relative z-20">
                <div className="container mx-auto px-3 md:px-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            {statusItems.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white p-5 md:p-6 rounded-[24px] shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col items-center text-center transition-all hover:-translate-y-1 hover:shadow-2xl"
                                >
                                    <div className={`${item.bgColor} ${item.color} p-4 rounded-2xl mb-4`}>
                                        <item.icon size={28} />
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="text-green-600 font-semibold text-sm">{item.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Changelog Section */}
            <section className="py-12 md:py-20 bg-gray-50/50">
                <div className="container mx-auto px-3 md:px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-4 mb-8 md:mb-12">
                            <div className="h-px flex-1 bg-gray-200"></div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 px-4">Histórico de Atualizações</h2>
                            <div className="h-px flex-1 bg-gray-200"></div>
                        </div>

                        <div className="space-y-8 md:space-y-12">
                            {changelogData.map((log, logIdx) => (
                                <div key={logIdx} className="relative pl-6 md:pl-12">
                                    {/* Timeline line */}
                                    <div className="absolute left-0 top-0 bottom-0 w-px bg-purple-200"></div>

                                    {/* Timeline Dot */}
                                    <div className="absolute left-[-6px] top-2 w-3 h-3 rounded-full bg-purple-600 shadow-[0_0_0_4px_rgba(147,51,234,0.1)]"></div>

                                    <div className="bg-white p-5 md:p-8 rounded-[24px] md:rounded-[32px] shadow-sm border border-gray-100">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl md:text-2xl font-bold text-gray-900">{log.date}</h3>
                                            </div>
                                            <div className="w-24 justify-center align-center flex bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider">
                                                UPDATE
                                            </div>
                                        </div>

                                        <div className="space-y-3 md:space-y-3">
                                            {log.changes.map((change, changeIdx) => (
                                                <div key={changeIdx} className="flex gap-4 group">
                                                    <div className="mt-1.5 flex-shrink-0">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-300 group-hover:bg-purple-600 transition-colors"></div>
                                                    </div>
                                                    <div className="flex flex-col items-start gap-1 flex-1">
                                                        <div className="flex-shrink-0">
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold bg-gray-100 text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-700 transition-all uppercase tracking-widest leading-none border border-transparent group-hover:border-purple-200">
                                                                {change.category}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm md:text-base text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors">
                                                            {change.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Support CTA */}
            <section className="py-12 md:py-20">
                <div className="container mx-auto px-3 md:px-6">
                    <div className="max-w-4xl mx-auto bg-purple-600 rounded-[24px] md:rounded-[32px] p-6 md:p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-purple-200">
                        {/* Decorative circles */}
                        <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-[-50px] right-[-50px] w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>

                        <div className="relative z-10">
                            <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">Necessita de Assistência Técnica?</h2>
                            <p className="text-purple-100 text-base md:text-lg mb-8 md:mb-10 max-w-xl mx-auto">
                                Caso identifique qualquer instabilidade ou comportamento atípico, nossa equipe de suporte está à disposição para auxiliá-lo.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
                                <a
                                    href="mailto:atendimento@streamshare.com.br"
                                    className="px-8 py-4 bg-white text-purple-600 font-bold rounded-2xl hover:scale-105 transition-all w-full sm:w-auto text-sm md:text-base"
                                >
                                    Falar com Suporte
                                </a>
                                <Link
                                    href={session ? "/dashboard" : "/login"}
                                    className="px-8 py-4 bg-purple-700/50 text-white font-bold rounded-2xl border border-white/20 hover:bg-purple-700 transition-all w-full sm:w-auto flex items-center justify-center gap-2 text-sm md:text-base"
                                >
                                    {session ? "Ir para o Painel" : "Acessar Plataforma"}
                                    <ArrowRight size={20} />
                                </Link>
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
