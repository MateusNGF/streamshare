"use client";

import { useState } from "react";
import { DollarSign, CheckCircle, AlertCircle, MessageCircle, Check, Search, XCircle, Eye } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { GenericFilter } from "@/components/ui/GenericFilter";
import { KPIFinanceiroCard } from "@/components/dashboard/KPIFinanceiroCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { confirmarPagamento, enviarNotificacaoCobranca, cancelarCobranca } from "@/actions/cobrancas";
import { useToast } from "@/hooks/useToast";
import { useCurrency } from "@/hooks/useCurrency";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dropdown } from "@/components/ui/Dropdown";
import { useRouter } from "next/navigation";
import { StreamingLogo } from "@/components/ui/StreamingLogo";

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
    const router = useRouter(); // Use router for refresh
    const { format } = useCurrency();

    // Filters State
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Data & UI State
    const [cobrancas, setCobrancas] = useState(cobrancasIniciais);
    const [loading, setLoading] = useState(false);
    const [sendingWhatsApp, setSendingWhatsApp] = useState<number | null>(null);

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
            // Optimistic update could happen here but refresh is safer for sync
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

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatPeriod = (start: Date, end: Date) => {
        const s = new Date(start);
        const e = new Date(end);
        return `${s.getDate()}/${s.getMonth() + 1} - ${e.getDate()}/${e.getMonth() + 1}`;
    };

    const isOverdue = (date: Date, status: string) => {
        return status === 'pendente' && new Date() > new Date(date);
    };

    const getCobrancaOptions = (cobranca: any) => {
        const options = [];

        options.push({
            label: "Detalhes",
            icon: <Eye size={16} />,
            onClick: () => {
                setSelectedCobrancaId(cobranca.id);
                setDetailsModalOpen(true);
            },
        });

        if (cobranca.assinatura.participante.whatsappNumero) {
            options.push({
                label: "Enviar WhatsApp",
                icon: <MessageCircle size={16} />,
                onClick: () => handleEnviarWhatsApp(cobranca.id),
            });
        }

        const isPendenteOrAtrasado = cobranca.status === "pendente" || cobranca.status === "atrasado";

        if (isPendenteOrAtrasado) {
            options.push({
                label: "Confirmar Pagamento",
                icon: <Check size={16} />,
                onClick: () => handleConfirmarPagamento(cobranca.id),
                variant: "success" as const,
            });
            options.push({
                label: "Cancelar Cobrança",
                icon: <XCircle size={16} />,
                onClick: () => handleCancelarCobranca(cobranca.id),
                variant: "danger" as const,
            });
        }

        return options;
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
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Participante</TableHead>
                                    <TableHead>Streaming</TableHead>
                                    <TableHead>Datas</TableHead>
                                    <TableHead>Valor</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCobrancas.map((cobranca: any) => (
                                    <TableRow key={cobranca.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-900">{cobranca.assinatura.participante.nome}</span>
                                                <span className="text-xs text-gray-500">{cobranca.assinatura.participante.whatsappNumero}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <StreamingLogo
                                                    name={cobranca.assinatura.streaming.apelido || cobranca.assinatura.streaming.catalogo.nome}
                                                    color={cobranca.assinatura.streaming.catalogo.corPrimaria || '#6d28d9'}
                                                    iconeUrl={cobranca.assinatura.streaming.catalogo.iconeUrl}
                                                    size="sm"
                                                    rounded="lg"
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {cobranca.assinatura.streaming.apelido || cobranca.assinatura.streaming.catalogo.nome}
                                                    </span>
                                                    {cobranca.assinatura.streaming.catalogo.nome !== (cobranca.assinatura.streaming.apelido) && (
                                                        <span className="text-xs text-gray-500">{cobranca.assinatura.streaming.catalogo.nome}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className={`font-medium ${isOverdue(cobranca.periodoFim, cobranca.status) ? 'text-red-600' : 'text-gray-900'}`}>
                                                    Vence em {formatDate(cobranca.periodoFim)}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    Ref: {formatPeriod(cobranca.periodoInicio, cobranca.periodoFim)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-bold text-gray-900">
                                                {format(Number(cobranca.valor))}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={cobranca.status} />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Dropdown options={getCobrancaOptions(cobranca)} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {/* Modal de Cancelamento */}
            <CancelarCobrancaModal
                isOpen={cancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                onConfirm={confirmCancellation}
                loading={loading}
            />

            {/* Modal de Confirmação de Pagamento */}
            <ConfirmarPagamentoModal
                isOpen={confirmPaymentModalOpen}
                onClose={() => setConfirmPaymentModalOpen(false)}
                onConfirm={executePaymentConfirmation}
                loading={loading}
            />

            {/* Modal de Detalhes */}
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
