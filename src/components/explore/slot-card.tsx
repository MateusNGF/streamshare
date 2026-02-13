"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/useToast";
import { requestParticipation } from "@/actions/requests";

interface SlotCardProps {
    streaming: {
        id: number;
        apelido?: string;
        valorIntegral: number | string;
        limiteParticipantes: number;
        catalogo: {
            nome: string;
            iconeUrl?: string;
            corPrimaria?: string;
        };
        conta: {
            nome: string;
        };
        _count: {
            assinaturas: number;
        };
    };
    onRequest: (id: number) => void;
}

export function SlotCard({ streaming, onRequest }: SlotCardProps) {
    const toast = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleRequest = () => {
        startTransition(async () => {
            const result = await requestParticipation(streaming.id);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Solicitação enviada!");
                setIsModalOpen(false);
            }
        });
    };

    const vagasOcupadas = streaming._count.assinaturas;
    const vagasDisponiveis = streaming.limiteParticipantes - vagasOcupadas;
    const precoPorPessoa = Number(streaming.valorIntegral) / streaming.limiteParticipantes;

    return (
        <Card className="hover:shadow-lg transition-shadow overflow-hidden flex flex-col h-full">
            <div className="h-2 w-full" style={{ backgroundColor: streaming.catalogo.corPrimaria || '#333' }} />
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                {/* Streaming Logo / Icon */}
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm"
                    style={{ backgroundColor: streaming.catalogo.corPrimaria || '#333' }}
                >
                    {streaming.catalogo.iconeUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={streaming.catalogo.iconeUrl} alt={streaming.catalogo.nome} className="w-8 h-8 object-contain" />
                    ) : (
                        streaming.catalogo.nome.substring(0, 1)
                    )}
                </div>
                <div>
                    <h3 className="font-bold text-lg leading-tight">{streaming.catalogo.nome}</h3>
                    {streaming.apelido && <p className="text-xs text-muted-foreground">{streaming.apelido}</p>}
                    <p className="text-xs text-muted-foreground mt-0.5">Grupo "{streaming.conta.nome}"</p>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="flex justify-between items-end mt-2">
                    <div>
                        <p className="text-2xl font-bold text-primary">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(precoPorPessoa)}
                        </p>
                        <p className="text-xs text-muted-foreground">/mês por vaga</p>
                    </div>
                    {vagasDisponiveis > 0 ? (
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                            {vagasDisponiveis} vaga{vagasDisponiveis !== 1 && 's'}
                        </Badge>
                    ) : (
                        <Badge variant="secondary">Esgotado</Badge>
                    )}
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span>{vagasOcupadas}/{streaming.limiteParticipantes} membros</span>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full"
                    disabled={vagasDisponiveis <= 0}
                    onClick={() => setIsModalOpen(true)}
                >
                    {vagasDisponiveis > 0 ? "Solicitar Entrada" : "Indisponível"}
                </Button>
            </CardFooter>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Solicitar Entrada</DialogTitle>
                        <p className="text-sm text-gray-500">
                            Ao solicitar entrada, o administrador do grupo será notificado. Uma assinatura de <strong>{streaming.catalogo.nome}</strong> será criada se ele aprovar.
                        </p>
                    </DialogHeader>

                    <div className="py-6 space-y-4">
                        <div className="bg-primary/5 p-4 rounded-2xl flex items-center gap-4 border border-primary/10">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                                style={{ backgroundColor: streaming.catalogo.corPrimaria || '#333' }}
                            >
                                {streaming.catalogo.nome[0]}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">{streaming.catalogo.nome}</p>
                                <p className="text-sm text-primary">R$ {precoPorPessoa.toFixed(2)}/mês</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 text-center">
                            Você será notificado via WhatsApp e sistema quando houver uma resposta.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isPending}>
                            Cancelar
                        </Button>
                        <Button onClick={handleRequest} disabled={isPending}>
                            {isPending ? "Enviando..." : "Confirmar Solicitação"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
