"use client";

import { useState } from "react";
import { Plus, Search, XCircle, Users, Activity, TrendingUp, Calendar, User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "@/hooks/useToast";
import { createBulkAssinaturas, cancelarAssinatura } from "@/actions/assinaturas";
import { AssinaturaMultiplaModal } from "@/components/modals/AssinaturaMultiplaModal";
import { CancelarAssinaturaModal } from "@/components/modals/CancelarAssinaturaModal";
import { DetalhesAssinaturaModal } from "@/components/modals/DetalhesAssinaturaModal";
import { KPIFinanceiroCard } from "@/components/dashboard/KPIFinanceiroCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { GenericFilter, FilterConfig } from "@/components/ui/GenericFilter";
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
import { Eye, Trash, CreditCard, AlertCircle, MessageCircle, History as HistoryIcon } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { calcularTotalCiclo } from "@/lib/financeiro-utils";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/Tooltip";
import { format as formatFN } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AssinaturasClientProps {
    initialSubscriptions: any[];
    participantes: any[];
    streamings: any[];
    kpis: {
        totalAtivas: number;
        totalSuspensas: number;
        receitaMensalEstimada: number;
        totalAssinaturas: number;
    };
}

export default function AssinaturasClient({
    initialSubscriptions,
    participantes,
    streamings,
    kpis
}: AssinaturasClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const toast = useToast();
    const { format } = useCurrency();

    // States
    const [isMultipleModalOpen, setIsMultipleModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedAssinatura, setSelectedAssinatura] = useState<any>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    // Filters
    const searchTerm = searchParams.get("search") || "";
    const statusFilter = searchParams.get("status") || "all";
    const streamingFilter = searchParams.get("streaming") || "all";

    const filters: FilterConfig[] = [
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
            className: "w-full md:w-[150px]",
            options: [
                { label: "Ativas", value: "ativa" },
                { label: "Suspensas", value: "suspensa" },
                { label: "Canceladas", value: "cancelada" }
            ]
        },
        {
            key: "streaming",
            type: "select",
            label: "Streaming",
            className: "w-full md:w-[200px]",
            options: streamings.map(s => ({
                label: s.apelido || s.catalogo.nome,
                value: s.id.toString()
            }))
        }
    ];

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === "" || value === "all") {
            params.delete(key);
        } else {
            params.set(key, value);
        }
        router.push(`/assinaturas?${params.toString()}`);
    };

    const handleCreateMultiple = async (data: any) => {
        setLoading(true);
        try {
            const result = await createBulkAssinaturas(data);
            const message = `${result.created} assinatura${result.created > 1 ? 's' : ''} criada${result.created > 1 ? 's' : ''} com sucesso!`;
            toast.success(message);
            setIsMultipleModalOpen(false);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Falha ao criar assinaturas');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelAssinatura = async (reason: string) => {
        if (!selectedAssinatura) return;
        setCancelling(true);
        try {
            await cancelarAssinatura(selectedAssinatura.id, reason);
            toast.success('Assinatura cancelada com sucesso');
            setCancelModalOpen(false);
            setSelectedAssinatura(null);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Falha ao cancelar assinatura');
        } finally {
            setCancelling(false);
        }
    };

    const streamingsWithOcupados = streamings.map(s => ({
        id: s.id,
        nome: s.apelido || s.catalogo.nome,
        apelido: s.apelido,
        catalogoNome: s.catalogo.nome,
        valorIntegral: Number(s.valorIntegral),
        limiteParticipantes: s.limiteParticipantes,
        ocupados: s._count?.assinaturas || 0,
        cor: s.catalogo.corPrimaria,
        iconeUrl: s.catalogo.iconeUrl,
        frequenciasHabilitadas: s.frequenciasHabilitadas
    }));

    return (
        <PageContainer>
            <PageHeader
                title="Assinaturas"
                description="Gerencie as assinaturas dos participantes e monitore a receita."
                action={
                    <Button
                        onClick={() => setIsMultipleModalOpen(true)}
                        className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] transition-all"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:inline">Nova Assinatura</span>
                        <span className="sm:hidden">Nova</span>
                    </Button>
                }
            />

            {/* KPIs Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <KPIFinanceiroCard
                    titulo="Receita Estimada"
                    valor={kpis.receitaMensalEstimada}
                    icone={TrendingUp}
                    cor="primary"
                />
                <KPIFinanceiroCard
                    titulo="Assinaturas Ativas"
                    valor={kpis.totalAtivas}
                    icone={Activity}
                    cor="green"
                />
                <KPIFinanceiroCard
                    titulo="Suspensas"
                    valor={kpis.totalSuspensas}
                    icone={XCircle}
                    cor="red"
                />
                <KPIFinanceiroCard
                    titulo="Total Histórico"
                    valor={kpis.totalAssinaturas}
                    icone={Users}
                    cor="primary"
                />
            </div>

            {/* Main Content Area */}
            <div className="space-y-10">

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <GenericFilter
                        filters={filters}
                        values={{ search: searchTerm, status: statusFilter, streaming: streamingFilter }}
                        onChange={handleFilterChange}
                        onClear={() => router.push('/assinaturas')}
                    />
                </div>

                {/* Table Content */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {initialSubscriptions.length > 0 ? (
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
                                            Status
                                        </TableHead>
                                        <TableHead className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                            <div className="flex items-center gap-2">
                                                <Activity size={12} className="text-gray-400" />
                                                Serviço
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                            <div className="flex items-center justify-center gap-2">
                                                <TrendingUp size={12} className="text-gray-400" />
                                                Frequência
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-2">
                                                <HistoryIcon size={12} className="text-gray-400" />
                                                Vigência (Período)
                                            </div>
                                        </TableHead>
                                        <TableHead className="text-right text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                            <div className="flex items-center justify-end gap-2">
                                                <CreditCard size={12} className="text-gray-400" />
                                                Valores
                                            </div>
                                        </TableHead>
                                        <TableHead className="w-[50px] text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">#</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {initialSubscriptions.map((sub) => {
                                        const isActive = sub.status === 'ativa';
                                        const isSuspended = sub.status === 'suspensa';
                                        const isCancelled = sub.status === 'cancelada';
                                        const isNonMonthly = sub.frequencia !== 'mensal';
                                        const valorCiclo = isNonMonthly ? calcularTotalCiclo(sub.valor, sub.frequencia) : null;

                                        const menuOptions = [
                                            {
                                                label: "Ver Detalhes",
                                                icon: <Eye size={16} />,
                                                onClick: () => {
                                                    setSelectedAssinatura(sub);
                                                    setDetailsModalOpen(true);
                                                }
                                            },
                                            ...(!isCancelled ? [
                                                { type: "separator" as const },
                                                {
                                                    label: "Cancelar Assinatura",
                                                    icon: <Trash size={16} />,
                                                    onClick: () => {
                                                        setSelectedAssinatura(sub);
                                                        setCancelModalOpen(true);
                                                    },
                                                    variant: "danger" as const
                                                }
                                            ] : [])
                                        ];

                                        return (
                                            <TableRow key={sub.id} className={cn(isCancelled && "opacity-60")}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-900 leading-tight">{sub.participante.nome}</span>
                                                        <span className="text-[11px] text-gray-500 truncate max-w-[150px]">{sub.participante.email || "-"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <StatusBadge status={sub.status} className="scale-75" />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <StreamingLogo
                                                            name={sub.streaming.catalogo.nome}
                                                            iconeUrl={sub.streaming.catalogo.iconeUrl}
                                                            color={sub.streaming.catalogo.corPrimaria}
                                                            size="sm"
                                                            rounded="md"
                                                        />
                                                        <span className="font-medium text-gray-700 text-sm truncate max-w-[100px]">
                                                            {sub.streaming.apelido || sub.streaming.catalogo.nome}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="inline-flex items-center gap-1 text-[10px] text-primary uppercase font-black bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                                                        <CreditCard size={10} />
                                                        {sub.frequencia}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {sub.cobrancas && sub.cobrancas.length > 0 ? (
                                                        <div className="inline-flex items-center gap-2 text-[10px] font-black text-gray-700 uppercase whitespace-nowrap bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                                            <span>{formatFN(new Date(sub.cobrancas[0].periodoInicio), 'MMM/yy', { locale: ptBR })}</span>
                                                            <span className="text-gray-300">|</span>
                                                            <span>{formatFN(new Date(sub.cobrancas[0].periodoFim), 'MMM/yy', { locale: ptBR })}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-gray-300 italic">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex flex-col items-end">
                                                        <div className="font-black text-sm text-gray-900">
                                                            {isNonMonthly ? (
                                                                <div className="flex flex-col items-end leading-tight">
                                                                    <span className="text-[8px] uppercase text-primary font-black">Ciclo</span>
                                                                    <span>{format(Number(valorCiclo))}</span>
                                                                </div>
                                                            ) : (
                                                                format(Number(sub.valor))
                                                            )}
                                                        </div>
                                                        <div className="text-[10px] text-gray-400 font-medium">
                                                            {format(Number(sub.valor))} / mês
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Dropdown options={menuOptions} />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <EmptyState
                            title="Nenhuma assinatura encontrada"
                            description="Tente ajustar os filtros ou crie uma nova assinatura."
                            icon={Search}
                            className="bg-transparent border-none"
                        />
                    )}
                </div>
            </div>

            {/* Modals */}
            <AssinaturaMultiplaModal
                isOpen={isMultipleModalOpen}
                onClose={() => setIsMultipleModalOpen(false)}
                onSave={handleCreateMultiple}
                participantes={participantes}
                streamings={streamingsWithOcupados}
                loading={loading}
            />

            <CancelarAssinaturaModal
                isOpen={cancelModalOpen}
                onClose={() => {
                    setCancelModalOpen(false);
                    setSelectedAssinatura(null);
                }}
                onConfirm={handleCancelAssinatura}
                assinatura={selectedAssinatura}
                loading={cancelling}
            />

            <DetalhesAssinaturaModal
                isOpen={detailsModalOpen}
                onClose={() => {
                    setDetailsModalOpen(false);
                    setSelectedAssinatura(null);
                }}
                assinatura={selectedAssinatura}
            />
        </PageContainer>
    );
}