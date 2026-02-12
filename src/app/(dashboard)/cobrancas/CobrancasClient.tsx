"use client";

import { useState } from "react";
import { DollarSign, CheckCircle, AlertCircle, Search } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { GenericFilter } from "@/components/ui/GenericFilter";
import { KPIFinanceiroCard } from "@/components/dashboard/KPIFinanceiroCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { confirmarPagamento, enviarNotificacaoCobranca, cancelarCobranca } from "@/actions/cobrancas";
import { useToast } from "@/hooks/useToast";
import { CobrancaCard } from "@/components/cobrancas/CobrancaCard";
import { useRouter } from "next/navigation";

import { CancelarCobrancaModal } from "@/components/modals/CancelarCobrancaModal";
import { ConfirmarPagamentoModal } from "@/components/modals/ConfirmarPagamentoModal";
import { DetalhesCobrancaModal } from "@/components/modals/DetalhesCobrancaModal";

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
    const router = useRouter();

    // Filters State
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // UI State
    const [cobrancas, setCobrancas] = useState(cobrancasIniciais);
    const [loading, setLoading] = useState(false);

    // Modal State
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [confirmPaymentModalOpen, setConfirmPaymentModalOpen] = useState(false);
    const [selectedCobrancaId, setSelectedCobrancaId] = useState<number | null>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);

    const filteredCobrancas = cobrancas.filter(c => {
        const matchesSearch = c.assinatura.participante.nome.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // --- Actions ---

    const handleConfirmarPagamento = (id: number) => {
        setSelectedCobrancaId(id);
        setConfirmPaymentModalOpen(true);
    };

    const executePaymentConfirmation = async () => {
        if (!selectedCobrancaId) return;
        setLoading(true);
        try {
            await confirmarPagamento(selectedCobrancaId);
            toast.success("Pagamento confirmado com sucesso!");
            setConfirmPaymentModalOpen(false);
            router.refresh();
            setTimeout(() => window.location.reload(), 500);
        } catch (error) {
            toast.error("Erro ao confirmar pagamento");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelarCobranca = (id: number) => {
        setSelectedCobrancaId(id);
        setCancelModalOpen(true);
    };

    const confirmCancellation = async () => {
        if (!selectedCobrancaId) return;
        setLoading(true);
        try {
            await cancelarCobranca(selectedCobrancaId);
            toast.success("Cobrança cancelada com sucesso!");
            setCancelModalOpen(false);
            router.refresh();
            setTimeout(() => window.location.reload(), 500);
        } catch (error: any) {
            toast.error(error.message || "Erro ao cancelar cobrança");
        } finally {
            setLoading(false);
        }
    };

    const handleEnviarWhatsApp = async (cobrancaId: number) => {
        try {
            const result = await enviarNotificacaoCobranca(cobrancaId);
            if (result.manualLink) {
                window.open(result.manualLink, '_blank');
                toast.info("Link do WhatsApp aberto! Envie a mensagem manualmente.");
            } else {
                toast.success("Notificação WhatsApp enviada automaticamente!");
            }
        } catch (error: any) {
            toast.error(error.message || "Erro ao enviar notificação");
        }
    };

    // --- Helpers ---

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const formatPeriod = (start: Date, end: Date) => {
        const s = new Date(start);
        const e = new Date(end);
        return `${s.getDate()}/${s.getMonth() + 1} - ${e.getDate()}/${e.getMonth() + 1}`;
    };

    const isOverdue = (date: Date, status: string) => {
        return (status === 'pendente' || status === "atrasado") && new Date() > new Date(date);
    };

    return (
        <PageContainer>
            <PageHeader
                title="Cobranças"
                description="Controle de pagamentos e envios de cobrança."
            />

            {/* KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6">
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

            {/* Header da Tabela - Desktop */}
            <div className="hidden md:grid grid-cols-[240px_120px_120px_100px_100px_auto] gap-5 px-8 pt-4 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                <div>Participante</div>
                <div className="text-center">Vencimento</div>
                <div className="text-center">Pagamento</div>
                <div className="text-right">Valor</div>
                <div className="text-center">Status</div>
                <div className="text-right pr-2">Ações</div>
            </div>

            {/* Lista de Cobranças */}
            <div className="flex flex-col gap-3 pb-20">
                {filteredCobrancas.length === 0 ? (
                    <EmptyState
                        icon={searchTerm || statusFilter !== 'all' ? Search : DollarSign}
                        title={searchTerm || statusFilter !== 'all' ? "Nenhuma cobrança encontrada" : "Tudo limpo!"}
                        description="Nenhuma cobrança corresponde aos critérios atuais."
                        className="bg-gray-50/50 border-dashed py-12"
                    />
                ) : (
                    filteredCobrancas.map((cobranca: any) => (
                        <CobrancaCard
                            key={cobranca.id}
                            cobranca={cobranca}
                            isOverdue={isOverdue(cobranca.dataVencimento, cobranca.status)}
                            formatDate={formatDate}
                            formatPeriod={formatPeriod}
                            onViewDetails={() => {
                                setSelectedCobrancaId(cobranca.id);
                                setDetailsModalOpen(true);
                            }}
                            onSendWhatsApp={() => handleEnviarWhatsApp(cobranca.id)}
                            onConfirmPayment={() => handleConfirmarPagamento(cobranca.id)}
                            onCancel={() => handleCancelarCobranca(cobranca.id)}
                        />
                    ))
                )}
            </div>

            {/* Modals */}
            <CancelarCobrancaModal
                isOpen={cancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                onConfirm={confirmCancellation}
                loading={loading}
            />

            <ConfirmarPagamentoModal
                isOpen={confirmPaymentModalOpen}
                onClose={() => setConfirmPaymentModalOpen(false)}
                onConfirm={executePaymentConfirmation}
                loading={loading}
            />

            <DetalhesCobrancaModal
                isOpen={detailsModalOpen}
                onClose={() => {
                    setDetailsModalOpen(false);
                    setSelectedCobrancaId(null);
                }}
                cobranca={cobrancas.find(c => c.id === selectedCobrancaId)}
            />
        </PageContainer>
    );
}