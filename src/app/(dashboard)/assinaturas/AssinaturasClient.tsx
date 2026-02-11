"use client";

import { useState } from "react";
import { Plus, Search, Eye, XCircle, Trash } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AssinaturaCard } from "@/components/assinaturas/AssinaturaCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/hooks/useToast";
import { useCurrency } from "@/hooks/useCurrency";
import { createBulkAssinaturas, cancelarAssinatura } from "@/actions/assinaturas";
import { AssinaturaMultiplaModal } from "@/components/modals/AssinaturaMultiplaModal";
import { CancelarAssinaturaModal } from "@/components/modals/CancelarAssinaturaModal";
import { DetalhesAssinaturaModal } from "@/components/modals/DetalhesAssinaturaModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { GenericFilter, FilterConfig } from "@/components/ui/GenericFilter";
import { Dropdown } from "@/components/ui/Dropdown";
import { StreamingLogo } from "@/components/ui/StreamingLogo";

interface AssinaturasClientProps {
    initialSubscriptions: any[];
    participantes: any[];
    streamings: any[];
}

export default function AssinaturasClient({
    initialSubscriptions,
    participantes,
    streamings
}: AssinaturasClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const toast = useToast();
    const { format } = useCurrency();
    const [isMultipleModalOpen, setIsMultipleModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedAssinatura, setSelectedAssinatura] = useState<any>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    // Get current filter values from URL
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

    // Prepare streamings data for the multiple modal
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
        frequenciasHabilitadas: s.frequenciasHabilitadas || "mensal,trimestral,semestral,anual"
    }));

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "ativa": return "Ativa";
            case "suspensa": return "Suspensa";
            case "cancelada": return "Cancelada";
            default: return status;
        }
    };

    return (
        <PageContainer>
            <PageHeader
                title="Assinaturas"
                description="Gerencie as assinaturas dos participantes."
                action={
                    <div className="flex gap-3">
                        <Button
                            onClick={() => setIsMultipleModalOpen(true)}
                            className="gap-2 bg-primary text-white shadow-lg shadow-primary/25"
                        >
                            <Plus size={20} />
                            <span className="hidden sm:inline">Nova Assinatura</span>
                            <span className="sm:hidden">Nova</span>
                        </Button>
                    </div>
                }
            />


            <div className="bg-card text-card-foreground shadow-sm">
                <div className="space-y-4">
                    <GenericFilter
                        filters={filters}
                        values={{
                            search: searchTerm,
                            status: statusFilter,
                            streaming: streamingFilter
                        }}
                        onChange={handleFilterChange}
                        onClear={() => {
                            router.push('/assinaturas');
                        }}
                    />

                    <div className="flex flex-col gap-3">
                        {/* Header da Lista - Desktop Only */}
                        <div className="hidden lg:flex items-center gap-4 px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 bg-gray-50/30 rounded-t-lg">
                            <div className="min-w-[240px]">Participante / WhatsApp</div>
                            <div className="min-w-[120px]">Serviço</div>
                            <div className="min-w-[120px]">Criada em</div>
                            <div className="flex-1">Custo Mensal / Ciclo</div>
                            <div className="min-w-[100px]">Status</div>
                            <div className="ml-auto w-12 text-right px-2">Ações</div>
                        </div>

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
                            <div className="col-span-full">
                                <EmptyState
                                    title="Nenhuma assinatura encontrada"
                                    description="Não encontramos nenhuma assinatura com os filtros selecionados."
                                    icon={Search}
                                    className="border-0 shadow-none py-12"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>



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
