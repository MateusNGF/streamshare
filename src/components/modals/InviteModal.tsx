"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { inviteUser } from "@/actions/invites";
import { useToast } from "@/hooks/useToast";

interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    contaId: number;
    streamings: any[]; // Define proper type if available
}

export function InviteModal({ isOpen, onClose, contaId, streamings }: InviteModalProps) {
    const toast = useToast();
    const [email, setEmail] = useState("");
    const [selectedStreamingId, setSelectedStreamingId] = useState<string>("all");
    const [isPending, startTransition] = useTransition();

    const resultStreamings = streamings || [];

    const handleSend = () => {
        if (!email) return;

        const formData = new FormData();
        formData.append("email", email);
        formData.append("contaId", String(contaId));
        if (selectedStreamingId && selectedStreamingId !== "all") {
            formData.append("streamingId", selectedStreamingId);
        }

        startTransition(async () => {
            const result = await inviteUser(formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Convite enviado com sucesso!");
                onClose();
                setEmail("");
                setSelectedStreamingId("all");
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Convidar Membro</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        Envie um convite por e-mail para participar do grupo.
                    </p>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">E-mail do Convidado</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="exemplo@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Vincular a uma Assinatura (Opcional)</Label>
                        <Select
                            value={selectedStreamingId}
                            onValueChange={setSelectedStreamingId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Sem vínculo (Apenas Grupo)</SelectItem>
                                {resultStreamings.map((s) => (
                                    <SelectItem key={s.id} value={String(s.id)}>
                                        {s.catalogo.nome} {s.apelido ? `(${s.apelido})` : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Se selecionar uma assinatura, ela será criada automaticamente ao aceitar.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isPending}>Cancelar</Button>
                    <Button onClick={handleSend} disabled={isPending || !email}>
                        {isPending ? "Enviando..." : "Enviar Convite"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
