"use client";

import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/Select";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/hooks/useToast";
import { formatCurrency } from "@/lib/utils";
import { createMultipleAssinaturas } from "@/actions/assinaturas";
import { AssinaturaMultiplaModal } from "@/components/modals/AssinaturaMultiplaModal";
import { EmptyState } from "@/components/ui/EmptyState";

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

    const handleCreateMultiple = async (data: any) => {
        setLoading(true);
        try {
            const result = await createMultipleAssinaturas(data);
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
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-3.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar participante..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                            <div className="w-full md:w-[180px]">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <Filter className="w-4 h-4 mr-2" />
                                        <span className="text-sm">
                                            {statusFilter === "all" ? "Todos" : getStatusLabel(statusFilter)}
                                        </span>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        <SelectItem value="ativa">Ativas</SelectItem>
                                        <SelectItem value="suspensa">Suspensas</SelectItem>
                                        <SelectItem value="cancelada">Canceladas</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-full md:w-[200px]">
                                <Select value={streamingFilter} onValueChange={setStreamingFilter}>
                                    <SelectTrigger>
                                        <span className="text-sm">
                                            {(() => {
                                                if (streamingFilter === "all") return "Todas";
                                                const s = streamings.find(s => s.id.toString() === streamingFilter);
                                                return s ? (s.apelido || s.catalogo.nome) : "Todas";
                                            })()}
                                        </span>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas</SelectItem>
                                        {streamings.map((s) => (
                                            <SelectItem key={s.id} value={s.id.toString()}>
                                                {s.apelido || s.catalogo.nome}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

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
