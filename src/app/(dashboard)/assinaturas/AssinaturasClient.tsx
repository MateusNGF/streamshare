"use client";

import { useState } from "react";
import { Plus, Search, XCircle, Users, Activity, TrendingUp } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AssinaturaCard } from "@/components/assinaturas/AssinaturaCard";
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
            <div className="space-y-6">

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <GenericFilter
                        filters={filters}
                        values={{ search: searchTerm, status: statusFilter, streaming: streamingFilter }}
                        onChange={handleFilterChange}
                        onClear={() => router.push('/assinaturas')}
                    />
                </div>

                {/* List Header (Desktop Only) */}
                <div className="hidden md:grid grid-cols-[240px_1fr_100px_120px_120px_auto] gap-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <div>Participante</div>
                    <div className="pl-4">Serviço</div>
                    <div className="text-center">Status</div>
                    <div className="text-right pr-4">Valor</div>
                    <div className="text-right pr-4">Total Grupo</div>
                    <div className="text-right">Ações</div>
                </div>

                {/* List Items */}
                <div className="flex flex-col gap-3">
                    {initialSubscriptions.length > 0 ? (
                        initialSubscriptions.map((sub) => (
                            <AssinaturaCard
                                key={sub.id}
                                sub={sub}
                                onViewDetails={() => {
                                    setSelectedAssinatura(sub);
                                    setDetailsModalOpen(true);
                                }}
                                onCancel={() => {
                                    setSelectedAssinatura(sub);
                                    setCancelModalOpen(true);
                                }}
                            />
                        ))
                    ) : (
                        <EmptyState
                            title="Nenhuma assinatura encontrada"
                            description="Tente ajustar os filtros ou crie uma nova assinatura."
                            icon={Search}
                            className="bg-gray-50/50 border-dashed"
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