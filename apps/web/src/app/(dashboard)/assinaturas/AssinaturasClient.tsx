"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AssinaturaModal } from "@/components/modals/AssinaturaModal";
import { AssinaturaMultiplaModal } from "@/components/modals/AssinaturaMultiplaModal";
import { createMultipleAssinaturas } from "@/actions/assinaturas";
import { formatCurrency } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "@/hooks/useToast";

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
    const toast = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMultipleModalOpen, setIsMultipleModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleCreateMultiple = async (data: any) => {
        setLoading(true);
        try {
            const result = await createMultipleAssinaturas(data);
            const message = `${result.created} assinatura${result.created > 1 ? 's' : ''} criada${result.created > 1 ? 's' : ''} com sucesso!`;
            toast.success(message);
            setIsMultipleModalOpen(false);
            window.location.reload(); // Refresh to show new subscriptions
        } catch (error: any) {
            toast.error(error.message || 'Falha ao criar assinaturas');
        } finally {
            setLoading(false);
        }
    };

    // Prepare streamings data with ocupados count
    const streamingsWithOcupados = streamings.map(s => ({
        id: s.id,
        nome: s.catalogo.nome,
        valorIntegral: Number(s.valorIntegral),
        limiteParticipantes: s.limiteParticipantes,
        ocupados: s._count?.assinaturas || 0,
        cor: s.catalogo.corPrimaria,
        frequenciasHabilitadas: s.frequenciasHabilitadas || "mensal,trimestral,semestral,anual"
    }));

    return (
        <PageContainer>
            <PageHeader
                title="Assinaturas"
                description="Gerencie as assinaturas dos participantes."
                action={
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 border-2 border-primary text-primary px-4 py-2 rounded-xl font-bold hover:bg-primary/10 transition-all"
                        >
                            <Plus size={18} />
                            <span className="hidden sm:inline">Nova Assinatura</span>
                            <span className="sm:hidden">Nova</span>
                        </button>
                        <button
                            onClick={() => setIsMultipleModalOpen(true)}
                            className="flex items-center gap-2 bg-primary hover:bg-accent text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/25 transition-all"
                        >
                            <Plus size={20} />
                            <span className="hidden sm:inline">Criar Múltiplas</span>
                            <span className="sm:hidden">Múltiplas</span>
                        </button>
                    </div>
                }
            />
            <div className="space-y-6">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Participante</TableHead>
                                <TableHead>Streaming</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Frequência</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {initialSubscriptions.map((sub) => (
                                <TableRow key={sub.id}>
                                    <TableCell className="font-medium">{sub.participante.nome}</TableCell>
                                    <TableCell>{sub.streaming.catalogo.nome}</TableCell>
                                    <TableCell>{formatCurrency(Number(sub.valor))}</TableCell>
                                    <TableCell className="capitalize">{sub.frequencia}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                sub.status === "ativa"
                                                    ? "success"
                                                    : sub.status === "suspensa"
                                                        ? "warning"
                                                        : "destructive"
                                            }
                                        >
                                            {sub.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {initialSubscriptions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        Nenhuma assinatura encontrada.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <AssinaturaModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />

                <AssinaturaMultiplaModal
                    isOpen={isMultipleModalOpen}
                    onClose={() => setIsMultipleModalOpen(false)}
                    onSave={handleCreateMultiple}
                    participantes={participantes}
                    streamings={streamingsWithOcupados}
                    loading={loading}
                />
            </div>
        </PageContainer>
    );
}
