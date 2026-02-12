"use client";

import { CheckCircle2, Server, Database, Bell, Shield, ArrowRight, Zap, RefreshCw, ChevronLeft, Copy } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { Tooltip } from "@/components/ui/Tooltip";
import Link from "next/link";
import { useState } from "react";
import { InsectInteractive } from "../backgrounds/InsectInteractive";

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
        id: "2026-02-12",
        date: "12/02/2026",
        changes: [
            { category: "Interface", description: "Transição para visualização em tabelas de alta densidade, otimizando o espaço e a leitura de dados com componentes reutilizáveis." },
            { category: "Faturamento", description: "Novo sistema de destaque financeiro que prioriza o valor total do ciclo com referência mensal secundária em todas as listagens." },
            { category: "Experiência", description: "Modais de detalhes aprimorados com histórico de faturamento unificado, contato rápido e cronômetros de vencimento." },
            { category: "Gestão", description: "Implementação de fluxos de cancelamento agendado, incluindo motivos, datas de término e identificação do solicitante para melhor controle." },
            { category: "Precisão", description: "Padronização dos períodos de vigência e datas de vencimento, garantindo consistência visual absoluta e integridade de dados no banco." },
            { category: "Dashboard", description: "Atualização dos indicadores financeiros (KPIs) com suporte a métricas dinâmicas e transições suaves de estado." },
            { category: "Mobile", description: "Otimização da interface para dispositivos móveis com layouts resilientes e melhor legibilidade em tabelas complexas." },
        ],
    },
    {
        id: "2026-02-11",
        date: "11/02/2026",
        changes: [
            { category: "Faturamento", description: "Sistema financeiro de alta precisão com detalhamento de taxas de gateway, valor líquido e indicadores de valor vitalício (LTV) por participante." },
            { category: "Dashboard", description: "Painel administrativo enriquecido com KPIs estratégicos, incluindo projeções de receita líquida e rastreamento inteligente de prazos de recebimento." },
            { category: "Precisão", description: "Aprimoramento dos cálculos monetários e novas validações de banco de dados para garantir integridade absoluta e prevenção de duplicidade." },
            { category: "Integrações", description: "Melhorias na comunicação com gateway de pagamento, incluindo desduplicação inteligente de eventos e sincronização em tempo real de transações." },
            { category: "Automação", description: "Processos automáticos para transição de status e reativação imediata de serviços após a confirmação de recebimento." },
            { category: "Experiência", description: "Implementação de assistentes visuais contextuais (tooltips) e melhorias significativas no processamento em lote de novas assinaturas." },
            { category: "Interface", description: "Padronização da identidade visual e ícones de streaming em toda a plataforma, garantindo consistência em cards, tabelas e janelas de detalhes." },
        ],
    },
    {
        id: "2026-02-10",
        date: "10/02/2026",
        changes: [
            { category: "Interatividade", description: "Implementação de sistema de física avançado para elementos interativos da página com animações realistas e estados visuais dinâmicos." },
            { category: "Design", description: "Redesign completo da seção principal com nova identidade visual, gradientes modernos, navegação aprimorada e componentes padronizados." },
            { category: "Acessibilidade", description: "Melhorias significativas em tooltips e componentes interativos com suporte total para leitores de tela e navegação por teclado." },
            { category: "Finanças", description: "Lançamento de transparência financeira com indicadores detalhados, resumos de ciclo dinâmicos e proteção contra deriva de datas em renovações." },
            { category: "Navegação", description: "Otimização do fluxo de usuário com logotipos clicáveis, botão de retorno estratégico e redirecionamento inteligente para maximizar conversão." },
            { category: "Monitoramento", description: "Lançamento da página de Status com visualização em tempo real da disponibilidade dos serviços e histórico compartilhável de atualizações." },
            { category: "Mobile", description: "Otimizações específicas para dispositivos móveis incluindo ajustes de espaçamento, camadas visuais e reorganização de formulários." },
            { category: "Profissionalização", description: "Revisão completa de textos e mensagens da interface para um tom mais profissional e técnico em toda a plataforma." },
        ],
    },
    {
        id: "2026-02-07",
        date: "07/02/2026",
        changes: [
            { category: "Notificações", description: "Expansão do sistema de configurações administrativas com suporte para novos canais de comunicação e integração de APIs de mensageria." },
            { category: "Pagamentos", description: "Implementação de chaves de pagamento persistentes com geração automática de templates visuais de renovação em múltiplos formatos." },
            { category: "Interface", description: "Reformulação completa do painel financeiro com layout moderno e escalável para visualização de dados complexos." },
            { category: "Gerenciamento", description: "Nova funcionalidade para cancelamento de cobranças pendentes com atualização instantânea e diálogos de confirmação aprimorados." },
            { category: "Auditoria", description: "Sistema centralizado de rastreamento para registro de ações críticas, notificações enviadas e alterações de configuração." },
            { category: "Integridade", description: "Melhorias nas operações de banco de dados para garantir consistência total e prevenção de conflitos em transações financeiras." },
        ],
    },
    {
        id: "2026-02-06",
        date: "06/02/2026",
        changes: [
            { category: "Flexibilidade", description: "Atualização nas regras de cadastro permitindo maior flexibilidade no processo de onboarding e campos opcionais para novos participantes." },
            { category: "Interface", description: "Melhorias no painel administrativo com correções de responsividade e alinhamento visual dos elementos de navegação." },
            { category: "Assinaturas", description: "Evolução no sistema permitindo que usuários adquiram múltiplas cotas de um mesmo grupo com seletor numérico para compras em quantidade." },
        ],
    },
    {
        id: "2026-02-05",
        date: "05/02/2026",
        changes: [
            { category: "Mobile", description: "Reformulação completa da navegação para dispositivos móveis com menu animado e melhorias de acessibilidade." },
            { category: "Performance", description: "Otimização de recursos visuais resultando em redução de 40% no tamanho dos arquivos da página inicial." },
            { category: "Simplicidade", description: "Simplificação do painel principal com remoção de elementos redundantes para melhor foco nas informações essenciais." },
        ],
    },
    {
        id: "2026-02-04",
        date: "04/02/2026",
        changes: [
            { category: "Validação", description: "Correção na lógica de validação de documentos permitindo maior flexibilidade para cadastro de dependentes e mensagens de erro aprimoradas." },
            { category: "Seleção", description: "Implementação de seleção múltipla no fluxo de criação de assinaturas e melhorias nos componentes com suporte aprimorado para acessibilidade." },
            { category: "Comunicação", description: "Revisão e padronização das mensagens de notificação de reajustes para maior clareza e profissionalismo." },
            { category: "Autenticação", description: "Redesign completo das telas de login e recuperação de senha com foco em conversão e experiência moderna." },
            { category: "Globalização", description: "Implementação de suporte multi-moeda para operações em diferentes países da América Latina (ARS, BOB, PYG, UYU, BRL)." },
            { category: "Interface", description: "Correções em diálogos modais, reorganização de configurações operacionais e ajustes de layout para dispositivos com telas pequenas." },
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
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = (id: string) => {
        const url = new URL(window.location.href);
        url.hash = id;
        navigator.clipboard.writeText(url.toString());
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="min-h-screen  w-full bg-white font-inter relative">

            <LandingNavbar session={session} />
            <InsectInteractive />


            {/* Hero Section */}
            <section className="relative pt-40 pb-40 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] text-white">
                <BackButton />
                <div className="container mx-auto h-full px-3 md:px-6 relative z-10">
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
                <div className="absolute bottom-0 left-0 w-full h-64 md:h-96 bg-gradient-to-t from-white via-white/20 to-transparent backdrop-blur-[2px]"></div>
            </section>

            {/* Status Section */}
            <section className="py-10 md:py-12 -mt-10 relative z-20">
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
                                <div
                                    key={logIdx}
                                    id={log.id}
                                    className="relative pl-6 md:pl-12 scroll-mt-24 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
                                    style={{ animationDelay: `${logIdx * 150}ms` }}
                                >
                                    {/* Timeline line */}
                                    <div className="absolute left-0 top-0 bottom-0 w-px bg-purple-200"></div>

                                    {/* Timeline Dot */}
                                    <div className="absolute left-[-6px] top-2 w-3 h-3 rounded-full bg-purple-600 shadow-[0_0_0_4px_rgba(147,51,234,0.1)]"></div>

                                    <div className="bg-white p-5 md:p-8 rounded-[24px] md:rounded-[32px] shadow-sm border border-gray-100 transition-all hover:bg-gray-50/30">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
                                            <div className="flex items-center gap-3 group/date">
                                                <h3 className="text-xl md:text-2xl font-bold text-gray-900">{log.date}</h3>
                                                <Tooltip
                                                    content="Copiado!"
                                                    isVisible={copiedId === log.id}
                                                    position="right"
                                                >
                                                    <button
                                                        onClick={() => handleCopy(log.id)}
                                                        className="p-1.5 rounded-lg bg-gray-50 text-gray-400 opacity-0 group-hover/date:opacity-100 hover:text-purple-600 hover:bg-purple-50 transition-all cursor-pointer"
                                                        title="Copiar link desta sessão"
                                                    >
                                                        {copiedId === log.id ? (
                                                            <CheckCircle2 size={14} className="text-green-500" />
                                                        ) : (
                                                            <Copy size={14} />
                                                        )}
                                                    </button>
                                                </Tooltip>
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
