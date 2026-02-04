"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/hooks/useToast";
import { formatCurrency } from "@/lib/utils";
import { createBulkAssinaturas } from "@/actions/assinaturas";
import { AssinaturaMultiplaModal } from "@/components/modals/AssinaturaMultiplaModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { GenericFilter, FilterConfig } from "@/components/ui/GenericFilter";

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
    const toast = useToast();
    const [isMultipleModalOpen, setIsMultipleModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [streamingFilter, setStreamingFilter] = useState<string>("all");

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
        if (key === "search") setSearchTerm(value);
        if (key === "status") setStatusFilter(value);
        if (key === "streaming") setStreamingFilter(value);
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

    // Filter Logic
    const filteredSubscriptions = initialSubscriptions.filter(sub => {
        const matchesSearch = sub.participante.nome.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
        const matchesStreaming = streamingFilter === "all" || sub.streamingId.toString() === streamingFilter;
        return matchesSearch && matchesStatus && matchesStreaming;
    });

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
                            setSearchTerm("");
                            setStatusFilter("all");
                            setStreamingFilter("all");
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
                                {filteredSubscriptions.length > 0 ? (
                                    filteredSubscriptions.map((sub) => (
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
                                            <TableCell>{formatCurrency(Number(sub.valor))}</TableCell>
                                            <TableCell className="capitalize">{sub.frequencia}</TableCell>
                                            <TableCell>
                                                <StatusBadge status={sub.status} />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {/* TODO: Add edit/cancel actions */}
                                                <Button variant="ghost" size="sm">
                                                    Detalhes
                                                </Button>
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
        </PageContainer>
    );
}
