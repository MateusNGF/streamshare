"use client";

import { useState } from "react";
import { DollarSign, CheckCircle, AlertCircle, Search, User, TrendingUp, Calendar } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { GenericFilter } from "@/components/ui/GenericFilter";
import { KPIFinanceiroCard } from "@/components/dashboard/KPIFinanceiroCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { confirmarPagamento, enviarNotificacaoCobranca, cancelarCobranca } from "@/actions/cobrancas";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Dropdown } from "@/components/ui/Dropdown";
import { MessageCircle, Check, Eye, Trash, Clock } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { format as formatFN } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

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
    const { format } = useCurrency();

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
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

            {/* Table Content */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {filteredCobrancas.length === 0 ? (
                    <EmptyState
                        icon={searchTerm || statusFilter !== 'all' ? Search : DollarSign}
                        title={searchTerm || statusFilter !== 'all' ? "Nenhuma cobrança encontrada" : "Tudo limpo!"}
                        description="Nenhuma cobrança corresponde aos critérios atuais."
                        className="bg-transparent border-none py-12"
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow className="hover:bg-transparent border-b border-gray-100">
                                    <TableHead className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <User size={12} className="text-gray-400" />
                                            Participante
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center justify-center gap-2">
                                            <TrendingUp size={12} className="text-gray-400" />
                                            Emissão
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center justify-center gap-2">
                                            <Calendar size={12} className="text-gray-400" />
                                            Vencimento
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                        Status
                                    </TableHead>
                                    <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                        Pagamento
                                    </TableHead>
                                    <TableHead className="text-right text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center justify-end gap-2">
                                            <DollarSign size={12} className="text-gray-400" />
                                            Valor
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                        Transação
                                    </TableHead>
                                    <TableHead className="w-[50px] text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">#</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCobrancas.map((cobranca: any) => {
                                    const isPaid = cobranca.status === 'pago';
                                    const isCancelled = cobranca.status === 'cancelado';
                                    const vencimentoDate = new Date(cobranca.dataVencimento);
                                    const atrasada = isOverdue(cobranca.dataVencimento, cobranca.status);

                                    const options = [
                                        {
                                            label: "Ver Detalhes",
                                            icon: <Eye size={16} />,
                                            onClick: () => {
                                                setSelectedCobrancaId(cobranca.id);
                                                setDetailsModalOpen(true);
                                            }
                                        },
                                        ...(!isPaid && !isCancelled ? [
                                            { type: "separator" as const },
                                            {
                                                label: "Confirmar Pagamento",
                                                icon: <Check size={16} />,
                                                onClick: () => handleConfirmarPagamento(cobranca.id)
                                            },
                                            {
                                                label: "Enviar WhatsApp",
                                                icon: <MessageCircle size={16} />,
                                                onClick: () => handleEnviarWhatsApp(cobranca.id)
                                            },
                                            {
                                                label: "Cancelar Cobrança",
                                                icon: <Trash size={16} />,
                                                onClick: () => handleCancelarCobranca(cobranca.id),
                                                variant: "danger" as const
                                            }
                                        ] : [])
                                    ];

                                    return (
                                        <TableRow key={cobranca.id} className={cn(isCancelled && "opacity-60")}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <StreamingLogo
                                                        name={cobranca.assinatura.streaming.catalogo.nome}
                                                        iconeUrl={cobranca.assinatura.streaming.catalogo.iconeUrl}
                                                        color={cobranca.assinatura.streaming.catalogo.corPrimaria}
                                                        size="sm"
                                                        rounded="md"
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-900 leading-tight">
                                                            {cobranca.assinatura.participante.nome}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 font-medium truncate max-w-[100px]">
                                                            {cobranca.assinatura.streaming.apelido || cobranca.assinatura.streaming.catalogo.nome}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs font-medium">
                                                        {formatDate(cobranca.createdAt).split(',')[0]}
                                                    </span>

                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className={cn(
                                                        "text-xs font-medium",
                                                        atrasada ? "text-red-600 font-bold" : "text-gray-700"
                                                    )}>
                                                        {formatDate(cobranca.dataVencimento)}
                                                    </span>
                                                    {atrasada && (
                                                        <div className="flex items-center gap-1 text-[9px] text-red-500 font-black uppercase tracking-tighter leading-none mt-0.5">
                                                            <Clock size={8} />
                                                            ATRASADA
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <StatusBadge status={cobranca.status} className="scale-75" />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="text-sm font-black text-gray-700">
                                                    {cobranca.dataPagamento ? formatDate(cobranca.dataPagamento).split(',')[0] : "-"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="font-black text-gray-900 text-sm">
                                                    {format(Number(cobranca.valor))}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex flex-col items-center gap-0.5">
                                                    <span className="text-[9px] font-black uppercase text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full border border-purple-100">
                                                        {cobranca.gatewayProvider || "Manual"}
                                                    </span>
                                                    {cobranca.gatewayTransactionId && (
                                                        <span className="text-[9px] text-gray-400 font-mono truncate max-w-[60px]" title={cobranca.gatewayTransactionId}>
                                                            ID:{cobranca.gatewayTransactionId.slice(-6)}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Dropdown options={options} />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
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