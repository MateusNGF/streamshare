"use client";

import { Plus, Search, Users, Activity, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { KPIFinanceiroCard } from "@/components/dashboard/KPIFinanceiroCard";
import { GenericFilter, FilterConfig } from "@/components/ui/GenericFilter";
import { useAssinaturasActions } from "@/hooks/useAssinaturasActions";
import { AssinaturasTable } from "@/components/assinaturas/AssinaturasTable";
import { AssinaturasModals } from "@/components/assinaturas/AssinaturasModals";
import { SectionHeader } from "@/components/layout/SectionHeader";

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
    const {
        isMultipleModalOpen, setIsMultipleModalOpen,
        cancelModalOpen, setCancelModalOpen,
        detailsModalOpen, setDetailsModalOpen,
        selectedAssinatura, setSelectedAssinatura,
        loading, cancelling,
        filters: filterValues,
        handleFilterChange,
        handleClearFilters,
        handleCreateMultiple,
        handleCancelSubmit,
        streamingsWithOcupados
    } = useAssinaturasActions(streamings);

    const filterConfig: FilterConfig[] = [
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
                value: s.id.toString(),
                icon: s.catalogo.iconeUrl,
                color: s.catalogo.corPrimaria
            }))
        },
        {
            key: "criacao",
            type: "dateRange",
            label: "Data de Início",
            placeholder: "Filtrar por data"
        },
        {
            key: "valor",
            type: "numberRange",
            label: "Intervalo de Valor",
            placeholder: "Valor entre..."
        },
        {
            key: "hasWhatsapp",
            type: "switch",
            label: "Apenas com WhatsApp",
            className: "md:w-auto"
        }
    ];

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

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <KPIFinanceiroCard
                    titulo="Receita Estimada"
                    valor={kpis.receitaMensalEstimada}
                    icone={TrendingUp}
                    cor="primary"
                    index={0}
                />
                <KPIFinanceiroCard
                    titulo="Assinaturas Ativas"
                    valor={kpis.totalAtivas}
                    icone={Activity}
                    cor="green"
                    isMoeda={false}
                    index={1}
                />
                <KPIFinanceiroCard
                    titulo="Suspensas"
                    valor={kpis.totalSuspensas}
                    icone={Users}
                    cor="red"
                    isMoeda={false}
                    index={2}
                />
                <KPIFinanceiroCard
                    titulo="Total Histórico"
                    valor={kpis.totalAssinaturas}
                    icone={Users}
                    cor="primary"
                    isMoeda={false}
                    index={3}
                />
            </div>

            <div className="space-y-10">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <GenericFilter
                        filters={filterConfig}
                        values={{
                            search: filterValues.searchTerm,
                            status: filterValues.statusFilter,
                            streaming: filterValues.streamingFilter,
                            criacao: filterValues.criacaoRange || "",
                            valor: filterValues.valorRange || "",
                            hasWhatsapp: filterValues.hasWhatsappFilter || "false"
                        }}
                        onChange={handleFilterChange}
                        onClear={handleClearFilters}
                    />
                </div>

                <div className="space-y-6">
                    <SectionHeader title="Listagem de Assinaturas" className="mb-0" />
                    <AssinaturasTable
                        subscriptions={initialSubscriptions}
                        onViewDetails={(sub) => {
                            setSelectedAssinatura(sub);
                            setDetailsModalOpen(true);
                        }}
                        onCancel={(sub) => {
                            setSelectedAssinatura(sub);
                            setCancelModalOpen(true);
                        }}
                    />
                </div>
            </div>

            <AssinaturasModals
                isMultipleModalOpen={isMultipleModalOpen}
                onCloseMultiple={() => setIsMultipleModalOpen(false)}
                onSaveMultiple={handleCreateMultiple}
                loading={loading}
                participantes={participantes}
                streamingsWithOcupados={streamingsWithOcupados}
                cancelModalOpen={cancelModalOpen}
                onCloseCancel={() => {
                    setCancelModalOpen(false);
                    setSelectedAssinatura(null);
                }}
                onConfirmCancel={handleCancelSubmit}
                cancelling={cancelling}
                selectedAssinatura={selectedAssinatura}
                detailsModalOpen={detailsModalOpen}
                onCloseDetails={() => {
                    setDetailsModalOpen(false);
                    setSelectedAssinatura(null);
                }}
            />
        </PageContainer>
    );
}
