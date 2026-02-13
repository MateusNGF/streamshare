"use client";

import { useState, useTransition } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { acceptInvite } from "@/actions/invites";
import { useToast } from "@/hooks/useToast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UserInvitesListProps {
    initialInvites: any[];
}

export function UserInvitesList({ initialInvites }: UserInvitesListProps) {
    const toast = useToast();
    const [invites, setInvites] = useState(initialInvites);
    const [pendingId, setPendingId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleAccept = (token: string, id: string) => {
        setPendingId(id);
        startTransition(async () => {
            const result = await acceptInvite(token);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Convite aceito! Você agora é membro.");
                setInvites(invites.filter(i => i.id !== id));
            }
            setPendingId(null);
        });
    };

    if (invites.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground border rounded-2xl border-dashed">
                Você não tem convites pendentes.
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {invites.map((invite) => (
                <Card key={invite.id}>
                    <CardHeader>
                        <h3 className="font-bold text-lg">Convite para {invite.conta.nome}</h3>
                        <p className="text-sm text-gray-500">
                            Enviado por {invite.convidadoPor.nome} • {formatDistanceToNow(new Date(invite.createdAt), { addSuffix: true, locale: ptBR })}
                        </p>
                    </CardHeader>
                    <CardContent>
                        {invite.streaming ? (
                            <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                                <div className="w-10 h-10 rounded bg-primary text-white flex items-center justify-center font-bold">
                                    {invite.streaming.catalogo.nome[0]}
                                </div>
                                <div>
                                    <p className="font-medium text-sm">Assinatura Inclusa</p>
                                    <p className="text-xs text-gray-500">{invite.streaming.catalogo.nome}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm">Acesso ao grupo como membro.</p>
                        )}
                    </CardContent>
                    <CardFooter className="gap-2">
                        <Button
                            className="w-full"
                            onClick={() => handleAccept(invite.token, invite.id)}
                            disabled={pendingId === invite.id}
                        >
                            {pendingId === invite.id ? "Aceitando..." : "Aceitar Convite"}
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}
