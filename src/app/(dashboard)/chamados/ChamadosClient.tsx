"use client";

import { useState } from "react";
import { TicketDetailsView } from "@/components/support/TicketDetailsView";
import { useSupportForm } from "@/hooks/useSupportForm";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

// Extracted Components
import { SupportDocsBanner } from "@/components/support/SupportDocsBanner";
import { SupportActionCard } from "@/components/support/SupportActionCard";
import { SupportHistoryPanel } from "@/components/support/SupportHistoryPanel";
import { SupportCreateTicketPanel } from "@/components/support/SupportCreateTicketPanel";
import { SupportEmptyState } from "@/components/support/SupportEmptyState";

export function ChamadosClient() {
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [isCreatingTicket, setIsCreatingTicket] = useState(false);

    const { formData, isPending, isLoggedIn, handleChange, handleSubmit } = useSupportForm({
        isOpen: true,
        onSuccess: () => {
            setIsCreatingTicket(false);
            // It would be great to refetch, but currently the Table fetches on mount. 
            // In a real app we'd pass a refresh key or trigger.
        },
    });

    const handleTicketClick = (ticket: any) => {
        setSelectedTicket(ticket);
        setIsCreatingTicket(false); // Close create form if open
    };

    const handleNewTicketClick = () => {
        setIsCreatingTicket(true);
        setSelectedTicket(null); // Close active ticket details if open
    };

    return (
        <PageContainer>
            <PageHeader
                title="Suporte & Chamados"
                description="Consulte a nossa base de conhecimento ou abra um ticket para a nossa equipa."
            />

            <div className="mt-4 flex flex-col gap-6 w-full max-w-full">
                <SupportDocsBanner />

                {/* Divider */}
                <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-gray-50 px-6 text-xs font-bold uppercase tracking-widest text-gray-400">
                            Ou então
                        </span>
                    </div>
                </div>

                {/* Área Dupla em Baixo: Esquerda (Ações + Tabela) / Direita (View ou Form) */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Coluna da Esquerda: Histórico e Botão */}
                    <div className="lg:w-1/2 xl:w-5/12 flex flex-col gap-6">
                        <SupportActionCard
                            onClick={handleNewTicketClick}
                            isActive={isCreatingTicket}
                        />
                        <SupportHistoryPanel
                            onTicketClick={handleTicketClick}
                            activeTicketId={selectedTicket?.id}
                        />
                    </div>

                    {/* Coluna da Direita: View Dinâmica (Formulário ou Detalhes) */}
                    <div className="lg:w-1/2 xl:w-7/12 shrink-0">
                        {isCreatingTicket ? (
                            <SupportCreateTicketPanel
                                onCancel={() => setIsCreatingTicket(false)}
                                formData={formData}
                                handleChange={handleChange}
                                handleSubmit={handleSubmit}
                                isPending={isPending}
                                isLoggedIn={isLoggedIn}
                            />
                        ) : selectedTicket ? (
                            <TicketDetailsView
                                ticket={selectedTicket}
                                onClose={() => setSelectedTicket(null)}
                            />
                        ) : (
                            <SupportEmptyState />
                        )}
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
