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
        id: "2026-02-14",
        date: "14/02/2026",
        changes: [
            { category: "Segurança", description: "Implementação de sanitização global de erros na API para impedir vazamento de dados sensíveis em respostas de falha." },
            { category: "Interface", description: "Reorganização estrutural da Barra Lateral com novo agrupamento lógico de itens de conta e navegação intuitiva." },
            { category: "Mobile", description: "Correção crítica de layout no menu de navegação móvel para eliminar problemas de visualização em telas menores." },
            { category: "Interface", description: "Refatoração modular da visualização de Faturas e refinamento estético dos cabeçalhos nos modais de detalhes." },
            { category: "Faturamento", description: "Melhoria no assistente de **Criação em Lote** com novos indicadores de lucro líquido e análise detalhada de rentabilidade." },
            { category: "Precisão", description: "Refatoração do motor de cálculo no **Gerenciador de Lotes** para garantir precisão absoluta em rateios complexos." },
            { category: "Interface", description: "Redesign nos componentes de **Configuração de Valores**, oferecendo feedback visual imediato sobre margens." },
            { category: "Mobile", description: "Otimização responsiva nos campos de edição de valores, facilitando a gestão financeira via smartphones." },
            { category: "Experiência", description: "Novas validações inteligentes na **Seleção de Participantes** para prevenir excedente de vagas por serviço." },
        ],
    },
    {
        id: "2026-02-13",
        date: "13/02/2026",
        changes: [
            { category: "Experiência", description: "Lançamento da **Central de Ajuda** com abertura de chamados, histórico de suporte e notificações de status em tempo real." },
            { category: "Interface", description: "Reorganização da barra lateral em grupos lógicos, agilizando a navegação entre módulos de gestão e faturamento." },
            { category: "Experiência", description: "Novo portal de **Descoberta de Grupos** para facilitar a busca e solicitação de entrada em novas redes." },
            { category: "Faturamento", description: "Automação do processamento de renovações e expansão dos controles para serviços recorrentes." },
            { category: "Interface", description: "Modernização visual das notificações com distinção clara entre alertas administrativos e mensagens de usuário." },
            { category: "Interface", description: "Padronização global de inputs e botões para garantir consistência visual em todos os formulários." },
            { category: "Performance", description: "Otimização do núcleo da aplicação para eliminar latência e garantir estabilidade durante picos de acesso." },
        ],
    },
    {
        id: "2026-02-12",
        date: "12/02/2026",
        changes: [
            { category: "Interface", description: "Adoção de tabelas de alta densidade para exibir mais dados relevantes sem exigir rolagem excessiva." },
            { category: "Faturamento", description: "Destaque visual para o valor total do ciclo nas listagens, facilitando a rápida identificação de montantes." },
            { category: "Experiência", description: "Unificação do histórico financeiro e contatos nos modais de **Detalhes da Assinatura**." },
            { category: "Experiência", description: "Novo fluxo de **Cancelamento Agendado**, permitindo programar o encerramento de serviços com justificativa." },
            { category: "Precisão", description: "Padronização estrita de formatos de data e vigência para evitar ambiguidades em renovações." },
            { category: "Interface", description: "Atualização dos cards de KPIs com animações suaves e métricas em tempo real." },
            { category: "Mobile", description: "Adaptação de tabelas complexas para visualização em cards responsivos em telas menores." },
        ],
    },
    {
        id: "2026-02-11",
        date: "11/02/2026",
        changes: [
            { category: "Faturamento", description: "Detalhamento financeiro expandido com visão de taxas de gateway, receita líquida e LTV por usuário." },
            { category: "Interface", description: "Painel administrativo com novos gráficos de projeção de receita e prazos de recebimento." },
            { category: "Precisão", description: "Blindagem do sistema de cálculos monetários contra erros de arredondamento em múltiplas moedas." },
            { category: "Integrações", description: "Sincronização em tempo real com gateway de pagamentos e tratamento inteligente de duplicidade de eventos." },
            { category: "Automação", description: "Reativação instantânea de serviços suspensos assim que a confirmação de pagamento é processada." },
            { category: "Experiência", description: "Inclusão de tooltips explicativos em termos financeiros complexos para facilitar o entendimento." },
            { category: "Interface", description: "Unificação da identidade visual dos serviços de streaming em todos os componentes da plataforma." },
        ],
    },
    {
        id: "2026-02-10",
        date: "10/02/2026",
        changes: [
            { category: "Interface", description: "Nova dinâmica interativa nos elementos da página com respostas visuais fluidas ao cursor." },
            { category: "Interface", description: "Redesign da **Home** com identidade visual modernizada e arquitetura de informação mais clara." },
            { category: "Experiência", description: "Compatibilidade total com leitores de tela e navegação por teclado em todos os componentes interativos." },
            { category: "Faturamento", description: "Painel de transparência financeira com resumo claro de custos, lucros e datas de corte." },
            { category: "Interface", description: "Botões de ação estrategicamente posicionados para reduzir o número de cliques até a conversão." },
            { category: "Experiência", description: "Inauguração desta página de **Status e Changelog** para transparência total das atualizações." },
            { category: "Mobile", description: "Refinamento de espaçamentos e tamanhos de toque para melhorar a ergonomia em smartphones." },
            { category: "Experiência", description: "Revisão profissional de toda a redação da plataforma para uma comunicação mais direta e técnica." },
        ],
    },
    {
        id: "2026-02-07",
        date: "07/02/2026",
        changes: [
            { category: "Integrações", description: "Suporte expandido para novos canais de notificação e integração com ferramentas de chat." },
            { category: "Faturamento", description: "Geração automática de comprovantes visuais de renovação prontos para compartilhamento." },
            { category: "Interface", description: "Novo layout do dashboard financeiro focado em legibilidade de grandes volumes de dados." },
            { category: "Experiência", description: "Permissão para cancelar cobranças pendentes incorretas com atualização imediata do saldo." },
            { category: "Segurança", description: "Registro detalhado de ações administrativas críticas para auditoria e segurança da conta." },
            { category: "Precisão", description: "Reforço nas travas de banco de dados para impedir condições de corrida em transações financeiras." },
        ],
    },
    {
        id: "2026-02-06",
        date: "06/02/2026",
        changes: [
            { category: "Experiência", description: "Flexibilização do formulário de cadastro, tornando opcionais campos não essenciais para o início rápido." },
            { category: "Interface", description: "Correção de alinhamentos visuais no menu administrativo em resoluções ultra-wide." },
            { category: "Faturamento", description: "Seletor de quantidade para compra de múltiplas cotas do mesmo serviço em um único checkout." },
        ],
    },
    {
        id: "2026-02-05",
        date: "05/02/2026",
        changes: [
            { category: "Mobile", description: "Novo menu de navegação móvel com animações suaves e acesso rápido às funções principais." },
            { category: "Performance", description: "Redução de 40% no peso da página inicial através da otimização de assets gráficos." },
            { category: "Experiência", description: "Limpeza visual do painel principal, removendo métricas secundárias para destacar o essencial." },
        ],
    },
    {
        id: "2026-02-04",
        date: "04/02/2026",
        changes: [
            { category: "Precisão", description: "Validação de documentos (CPF) mais robusta, aceitando regras específicas para dependentes." },
            { category: "Experiência", description: "Seleção múltipla facilitada na criação de assinaturas, agilizando o cadastro em massa." },
            { category: "Experiência", description: "Padronização dos textos de notificação de reajuste de preços para maior clareza." },
            { category: "Segurança", description: "Nova interface de login e recuperação de senha, focada em segurança e facilidade de acesso." },
            { category: "Faturamento", description: "Suporte nativo para múltiplas moedas (BRL, ARS, USD) em toda a plataforma." },
            { category: "Interface", description: "Ajustes de layout em modais para garantir visualização completa em telas pequenas." },
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
