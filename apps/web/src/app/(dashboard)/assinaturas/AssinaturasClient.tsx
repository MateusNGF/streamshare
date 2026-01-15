"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AssinaturaModal } from "@/components/modals/AssinaturaModal";
import { formatCurrency } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

interface AssinaturasClientProps {
    initialSubscriptions: any[];
}

export default function AssinaturasClient({ initialSubscriptions }: AssinaturasClientProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <PageContainer>
            <PageHeader
                title="Assinaturas"
                description="Gerencie as assinaturas dos participantes."
                action={
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Assinatura
                    </Button>
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
            </div>
        </PageContainer>
    );
}
