"use client";

import { useState, useTransition } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { approveRejectParticipation } from "@/actions/requests";
import { useToast } from "@/hooks/useToast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AdminRequestsListProps {
    initialRequests: any[];
}

export function AdminRequestsList({ initialRequests }: AdminRequestsListProps) {
    const toast = useToast();
    const [requests, setRequests] = useState(initialRequests);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleAction = (id: number, action: 'approve' | 'reject') => {
        setProcessingId(id);
        startTransition(async () => {
            const result = await approveRejectParticipation(id, action);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success(result?.message || "Ação realizada.");
                setRequests(requests.filter(r => r.id !== id));
            }
            setProcessingId(null);
        });
    };

    if (requests.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground border rounded-2xl border-dashed">
                Não há solicitações pendentes.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {requests.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm">
                    <div className="flex items-center gap-4">
                        <Avatar>
                            <AvatarImage src={req.usuario?.image || undefined} />
                            <AvatarFallback>{req.nome[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h4 className="font-bold">{req.nome}</h4>
                            <p className="text-xs text-gray-500">
                                {req.email} • Solicitado {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true, locale: ptBR })}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            border-red-200
                            onClick={() => handleAction(req.id, 'reject')}
                            disabled={processingId === req.id}
                        >
                            Recusar
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => handleAction(req.id, 'approve')}
                            disabled={processingId === req.id}
                        >
                            Aprovar
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
