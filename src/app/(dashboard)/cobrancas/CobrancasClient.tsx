"use client";

import { useState, useEffect, useRef } from "react";
import { DollarSign, CheckCircle, AlertCircle, MessageCircle, MoreVertical, Check, Search } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { GenericFilter } from "@/components/ui/GenericFilter";
import { KPIFinanceiroCard } from "@/components/dashboard/KPIFinanceiroCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { confirmarPagamento, enviarNotificacaoCobranca } from "@/actions/cobrancas";
import type { EnviarNotificacaoResult } from "@/types/whatsapp";
import { useToast } from "@/hooks/useToast";

interface CobrancasClientProps {
    kpis: {
        totalPendente: number;
        receitaConfirmada: number;
        emAtraso: number;
        totalCobrancas: number;
    };
    cobrancasIniciais: any[];
    whatsappConfigurado: boolean;
}

export function CobrancasClient({ kpis, cobrancasIniciais, whatsappConfigurado }: CobrancasClientProps) {
    const toast = useToast();

    // Filters State
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Data & UI State
    const [cobrancas, setCobrancas] = useState(cobrancasIniciais);
    const [loading, setLoading] = useState(false);
    const [sendingWhatsApp, setSendingWhatsApp] = useState<number | null>(null);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredCobrancas = cobrancas.filter(c => {
        const matchesSearch = c.assinatura.participante.nome.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleConfirmarPagamento = async (id: number) => {
        setLoading(true);
        try {
            await confirmarPagamento(id);
            toast.success("Pagamento confirmado com sucesso!");
            // Refresh the page to update data
            window.location.reload();
        } catch (error) {
            toast.error("Erro ao confirmar pagamento");
            setLoading(false);
        }
    };

    const handleEnviarWhatsApp = async (cobrancaId: number) => {
        setSendingWhatsApp(cobrancaId);
        try {
            const result = await enviarNotificacaoCobranca(cobrancaId);

            // Se retornou link manual, abrir em nova aba
            if (result.manualLink) {
                window.open(result.manualLink, '_blank');
                toast.info("Link do WhatsApp aberto! Envie a mensagem manualmente.");
            } else {
                toast.success("Notificação WhatsApp enviada automaticamente!");
            }
        } catch (error: any) {
            toast.error(error.message || "Erro ao enviar notificação");
        } finally {
            setSendingWhatsApp(null);
        }
    };

    return (
        <PageContainer>
            <PageHeader
                title="Cobranças"
                description="Gestão financeira de pagamentos"
            />

            {/* KPIs Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <KPIFinanceiroCard
                    titulo="Total a Receber"
                    valor={kpis.totalPendente}
                    icone={DollarSign}
                    cor="primary"
                />
                <KPIFinanceiroCard
                    titulo="Receita Confirmada"
                    valor={kpis.receitaConfirmada}
                    icone={CheckCircle}
                    cor="green"
                />
                <KPIFinanceiroCard
                    titulo="Em Atraso"
                    valor={kpis.emAtraso}
                    icone={AlertCircle}
                    cor="red"
                />
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 md:mb-8">
                <GenericFilter
                    filters={[
                        {
                            key: "search",
                            type: "text",
                            placeholder: "Buscar participante...",
                            className: "flex-1 min-w-[200px]"
                        },
                        {
                            key: "status",
                            type: "select",
                            label: "Status",
                            className: "w-full md:w-[200px]",
                            options: [
                                { label: "Pendente", value: "pendente" },
                                { label: "Pago", value: "pago" },
                                { label: "Atrasado", value: "atrasado" },
                                { label: "Cancelado", value: "cancelado" }
                            ]
                        }
                    ]}
                    values={{ search: searchTerm, status: statusFilter }}
                    onChange={(key: string, value: string) => {
                        if (key === "search") setSearchTerm(value);
                        if (key === "status") setStatusFilter(value);
                    }}
                    onClear={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                    }}
                />
            </div>

            {/* Charges Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {filteredCobrancas.length === 0 ? (
                    <EmptyState
                        icon={searchTerm || statusFilter !== 'all' ? Search : DollarSign}
                        title={searchTerm || statusFilter !== 'all' ? "Nenhuma cobrança encontrada" : "Nenhuma cobrança registrada"}
                        description={
                            searchTerm || statusFilter !== 'all'
                                ? "Não encontramos nenhuma cobrança com os filtros selecionados."
                                : "Crie assinaturas para participantes e as cobranças serão geradas automaticamente."
                        }
                    />
                ) : (
                    <div className="overflow-x-scroll min-h-[calc(100vh-20rem)] ">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left p-4 text-sm font-semibold text-gray-700">Participante</th>
                                    <th className="text-left p-4 text-sm font-semibold text-gray-700">Streaming</th>
                                    <th className="text-right p-4 text-sm font-semibold text-gray-700">Valor</th>
                                    <th className="text-left p-4 text-sm font-semibold text-gray-700">Período</th>
                                    <th className="text-left p-4 text-sm font-semibold text-gray-700">Vencimento</th>
                                    <th className="text-left p-4 text-sm font-semibold text-gray-700">Status</th>
                                    <th className="text-center p-4 text-sm font-semibold text-gray-700 w-20">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCobrancas.map((cobranca: any) => (
                                    <tr key={cobranca.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900">
                                                {cobranca.assinatura.participante.nome}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {cobranca.assinatura.participante.whatsappNumero}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: cobranca.assinatura.streaming.catalogo.corPrimaria }}
                                                />
                                                <span className="text-sm text-gray-700">
                                                    {cobranca.assinatura.streaming.apelido || cobranca.assinatura.streaming.catalogo.nome}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="font-semibold text-gray-900">
                                                {new Intl.NumberFormat('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL'
                                                }).format(Number(cobranca.valor))}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-gray-600">
                                                {new Date(cobranca.periodoInicio).toLocaleDateString('pt-BR', {
                                                    day: '2-digit',
                                                    month: 'short'
                                                })} - {new Date(cobranca.periodoFim).toLocaleDateString('pt-BR', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-gray-900">
                                                {new Date(cobranca.periodoFim).toLocaleDateString('pt-BR')}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <StatusBadge status={cobranca.status} />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-center">
                                                <div className="relative" ref={openMenuId === cobranca.id ? menuRef : null}>
                                                    {/* Menu Button */}
                                                    <button
                                                        onClick={() => setOpenMenuId(openMenuId === cobranca.id ? null : cobranca.id)}
                                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="Ações"
                                                    >
                                                        <MoreVertical size={18} className="text-gray-600" />
                                                    </button>

                                                    {/* Dropdown Menu */}
                                                    {openMenuId === cobranca.id && (
                                                        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-20">
                                                            <div className="py-2">
                                                                {/* WhatsApp Option */}
                                                                {cobranca.assinatura.participante.whatsappNumero && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => {
                                                                                handleEnviarWhatsApp(cobranca.id);
                                                                                setOpenMenuId(null);
                                                                            }}
                                                                            disabled={!whatsappConfigurado || sendingWhatsApp === cobranca.id || cobranca.status === 'cancelado' || cobranca.status === 'pago'}
                                                                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent flex items-center gap-3 transition-colors"
                                                                        >
                                                                            <MessageCircle size={18} className="text-green-600 flex-shrink-0" />
                                                                            <div className="flex-1">
                                                                                <div className="font-medium text-gray-900">Enviar WhatsApp</div>
                                                                                {!whatsappConfigurado && (
                                                                                    <div className="text-xs text-gray-500 mt-0.5">WhatsApp não configurado</div>
                                                                                )}
                                                                                {cobranca.status === 'pago' && whatsappConfigurado && (
                                                                                    <div className="text-xs text-gray-500 mt-0.5">Cobrança já paga</div>
                                                                                )}
                                                                            </div>
                                                                        </button>
                                                                        {(cobranca.status === "pendente" || cobranca.status === "atrasado") && (
                                                                            <div className="border-t border-gray-100 my-1"></div>
                                                                        )}
                                                                    </>
                                                                )}

                                                                {/* Confirm Payment Option */}
                                                                {(cobranca.status === "pendente" || cobranca.status === "atrasado") && (
                                                                    <button
                                                                        onClick={() => {
                                                                            handleConfirmarPagamento(cobranca.id);
                                                                            setOpenMenuId(null);
                                                                        }}
                                                                        disabled={loading}
                                                                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition-colors"
                                                                    >
                                                                        <Check size={18} className="text-primary flex-shrink-0" />
                                                                        <div className="font-medium text-gray-900">Confirmar Pagamento</div>
                                                                    </button>
                                                                )}

                                                                {/* Payment Info */}
                                                                {cobranca.status === "pago" && cobranca.dataPagamento && (
                                                                    <div className="px-4 py-2.5 text-sm text-gray-600 bg-gray-50 border-t border-gray-100">
                                                                        <div className="flex items-center gap-2">
                                                                            <Check size={16} className="text-green-600" />
                                                                            <span>Pago em {new Date(cobranca.dataPagamento).toLocaleDateString('pt-BR')}</span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </PageContainer>
    );
}
