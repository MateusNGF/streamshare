"use client";

import { useTransition } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { requestParticipation } from "@/actions/requests";
import { useToast } from "@/hooks/useToast";

interface RequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    streaming: {
        id: number;
        catalogo: { nome: string };
        conta: { nome: string };
        valorIntegral: number | string;
        limiteParticipantes: number;
    } | null;
}

export function RequestModal({ isOpen, onClose, streaming }: RequestModalProps) {
    const toast = useToast();
    const [isPending, startTransition] = useTransition();

    if (!streaming) return null;

    const precoPorPessoa = Number(streaming.valorIntegral) / streaming.limiteParticipantes;

    const handleConfirm = () => {
        startTransition(async () => {
            const result = await requestParticipation(streaming.id);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Solicitação enviada! Aguarde aprovação do admin.");
                onClose();
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirmar Solicitação</DialogTitle>
                    <p className="text-sm text-gray-500">
                        Você está solicitando entrar no grupo para dividir a assinatura.
                    </p>
                </DialogHeader>

                <div className="py-4 space-y-2">
                    <p><strong>Serviço:</strong> {streaming.catalogo.nome}</p>
                    <p><strong>Grupo:</strong> {streaming.conta.nome}</p>
                    <p><strong>Valor Estimado:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(precoPorPessoa)} / mês</p>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isPending}>Cancelar</Button>
                    <Button onClick={handleConfirm} disabled={isPending}>
                        {isPending ? "Enviando..." : "Enviar Solicitação"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
