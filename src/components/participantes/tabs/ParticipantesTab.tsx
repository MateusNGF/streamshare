"use client";

import { GenericFilter } from "@/components/ui/GenericFilter";
import { ParticipantCard } from "@/components/participantes/ParticipantCard";
import { useState, useMemo } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Participante } from "@/types/participante";

interface Props {
    participants: Participante[];
    onEdit: (p: Participante) => void;
    onDelete: (p: Participante) => void;
    onView: (p: Participante) => void;
}

export function ParticipantesTab({ participants, onEdit, onDelete, onView }: Props) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredParticipants = useMemo(() => {
        return participants.filter((p) => {
            const search = searchTerm.toLowerCase();
            return (
                p.nome.toLowerCase().includes(search) ||
                (p.whatsappNumero && p.whatsappNumero.includes(search)) ||
                (p.cpf && p.cpf.includes(search))
            );
        });
    }, [participants, searchTerm]);

    return (
        <div className="space-y-2">
            <div className="py-6">
                <GenericFilter
                    filters={[{
                        key: "search",
                        type: "text",
                        placeholder: "Buscar por nome, telefone ou CPF...",
                        className: "w-full"
                    }]}
                    values={{ search: searchTerm }}
                    onChange={(_, value) => setSearchTerm(value)}
                    onClear={() => setSearchTerm("")}
                />
            </div>

            <div aria-live="polite" aria-atomic="true">
                {filteredParticipants.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        {filteredParticipants.map((p) => (
                            <ParticipantCard
                                key={p.id}
                                id={p.id}
                                name={p.nome}
                                whatsapp={p.whatsappNumero || undefined}
                                email={p.email || undefined}
                                cpf={p.cpf}
                                subscriptionsCount={p._count.assinaturas}
                                status={p._count.assinaturas > 0 ? "ativa" : "inativo"}
                                userId={p.userId}
                                onEdit={() => onEdit(p)}
                                onDelete={() => onDelete(p)}
                                onView={() => onView(p)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-8">
                        <EmptyState
                            title="Nenhum participante"
                            description="Nenhum participante para os filtros aplicados."
                            variant="default"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
