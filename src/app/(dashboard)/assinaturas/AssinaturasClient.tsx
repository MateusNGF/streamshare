"use client";

import { useState } from "react";
import { Plus, Search, Eye, XCircle, Trash } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/hooks/useToast";
import { useCurrency } from "@/hooks/useCurrency";
import { createBulkAssinaturas, cancelarAssinatura } from "@/actions/assinaturas";
import { AssinaturaMultiplaModal } from "@/components/modals/AssinaturaMultiplaModal";
import { CancelarAssinaturaModal } from "@/components/modals/CancelarAssinaturaModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { GenericFilter, FilterConfig } from "@/components/ui/GenericFilter";
import { Dropdown } from "@/components/ui/Dropdown";

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

    const handleCancelAssinatura = async () => {
        if (!selectedAssinatura) return;

        setCancelling(true);
        try {
            await cancelarAssinatura(selectedAssinatura.id);
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

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Participante</TableHead>
                                    <TableHead>Streaming</TableHead>
                                    <TableHead>Valor</TableHead>
                                    <TableHead>Frequência</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {initialSubscriptions.length > 0 ? (
                                    initialSubscriptions.map((sub) => (
                                        <TableRow key={sub.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span>{sub.participante.nome}</span>
                                                    <span className="text-xs text-muted-foreground">{sub.participante.whatsappNumero}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {sub.streaming.catalogo.iconeUrl ? (
                                                        <img
                                                            src={sub.streaming.catalogo.iconeUrl}
                                                            alt=""
                                                            className="w-6 h-6 object-contain rounded-md bg-white p-0.5"
                                                        />
                                                    ) : (
                                                        <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-xs">
                                                            {sub.streaming.catalogo.nome[0]}
                                                        </div>
                                                    )}
                                                    <span>{sub.streaming.apelido || sub.streaming.catalogo.nome}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{format(Number(sub.valor))}</TableCell>
                                            <TableCell className="capitalize">{sub.frequencia}</TableCell>
                                            <TableCell>
                                                <StatusBadge
                                                    status={sub.status}
                                                    dataCancelamento={sub.dataCancelamento}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Dropdown
                                                    options={[
                                                        {
                                                            label: "Detalhes",
                                                            icon: <Eye size={16} />,
                                                            onClick: () => {
                                                                // TODO: Implement details view
                                                                toast.info("Detalhes em breve");
                                                            }
                                                        },
                                                        ...(sub.status !== "cancelada" ? [
                                                            {
                                                                label: "Cancelar",
                                                                icon: <Trash size={16} />,
                                                                onClick: () => {
                                                                    setSelectedAssinatura(sub);
                                                                    setCancelModalOpen(true);
                                                                },
                                                                variant: "danger" as const
                                                            }
                                                        ] : [])
                                                    ]}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6}>
                                            <EmptyState
                                                title="Nenhuma assinatura encontrada"
                                                description="Não encontramos nenhuma assinatura com os filtros selecionados."
                                                icon={Search}
                                                className="border-0 shadow-none py-8 my-4"
                                            />
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
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
        </PageContainer>
    );
}
