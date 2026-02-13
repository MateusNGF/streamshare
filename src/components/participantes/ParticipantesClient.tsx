"use client";

import { useState } from "react";
import { Plus, Mail, Users, UserPlus } from "lucide-react";
import { ParticipantModal, ParticipantFormData } from "@/components/modals/ParticipantModal";
import { DeleteModal } from "@/components/modals/DeleteModal";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { createParticipante, updateParticipante, deleteParticipante } from "@/actions/participantes";
import { useToast } from "@/hooks/useToast";
import { Tabs } from "@/components/ui/Tabs";
import { InviteModal } from "@/components/participantes/InviteModal";
import { inviteUser, cancelInvite } from "@/actions/invites";
import { approveRequest, rejectRequest } from "@/actions/requests";
import { Participante, PendingInvite, PendingRequest, Streaming } from "@/types/participante";
import { ParticipantesTab } from "./tabs/ParticipantesTab";
import { SolicitacoesTab } from "./tabs/SolicitacoesTab";
import { ConvitesTab } from "./tabs/ConvitesTab";
import { useRouter, useSearchParams } from "next/navigation";

interface ParticipantesClientProps {
    initialData: Participante[];
    pendingInvites: PendingInvite[];
    pendingRequests: PendingRequest[];
    streamings: Streaming[];
}

export function ParticipantesClient({
    initialData,
    pendingInvites: initialInvites,
    pendingRequests: initialRequests,
    streamings
}: ParticipantesClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeTabFromUrl = searchParams.get("tab") || "participantes";

    const toast = useToast();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedParticipant, setSelectedParticipant] = useState<Participante | null>(null);
    const [loading, setLoading] = useState(false);

    const handleTabChange = (tab: string) => {
        router.push(`/participantes?tab=${tab}`, { scroll: false });
    };

    // Active participants only for the main list
    const activeParticipants = initialData.filter(p => p.status === "ativo");

    // Actions
    const handleAdd = async (data: ParticipantFormData) => {
        setLoading(true);
        try {
            await createParticipante(data);
            toast.success("Participante criado com sucesso!");
            setIsAddModalOpen(false);
        } catch (error) {
            toast.error("CPF ou WhatsApp já estão em uso");
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (data: { email: string; streamingId?: number }) => {
        setLoading(true);
        try {
            await inviteUser(data);
            toast.success("Convite enviado com sucesso!");
            setIsInviteModalOpen(false);
        } catch (error: any) {
            toast.error(error.message || "Erro ao enviar convite");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (solicitacaoId: string) => {
        setLoading(true);
        try {
            await approveRequest(solicitacaoId);
            toast.success("Solicitação aprovada!");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Erro ao aprovar solicitação");
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (solicitacaoId: string) => {
        setLoading(true);
        try {
            await rejectRequest(solicitacaoId);
            toast.success("Solicitação recusada.");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Erro ao recusar solicitação");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelInvite = async (inviteId: string) => {
        setLoading(true);
        try {
            await cancelInvite(inviteId);
            toast.success("Convite cancelado.");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || "Erro ao cancelar convite");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (data: ParticipantFormData) => {
        if (!selectedParticipant) return;
        setLoading(true);
        try {
            await updateParticipante(selectedParticipant.id, data);
            toast.success("Participante atualizado com sucesso!");
            setIsEditModalOpen(false);
        } catch (error) {
            toast.error("Erro ao atualizar participante");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedParticipant) return;
        setLoading(true);
        try {
            await deleteParticipante(selectedParticipant.id);
            toast.success("Participante excluído com sucesso!");
            setIsDeleteModalOpen(false);
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Erro ao excluir participante");
            }
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        {
            id: "participantes",
            label: `Participantes (${activeParticipants.length})`,
            icon: Users,
            content: (
                <ParticipantesTab
                    participants={activeParticipants}
                    onEdit={(p) => {
                        setSelectedParticipant(p);
                        setIsEditModalOpen(true);
                    }}
                    onDelete={(p) => {
                        setSelectedParticipant(p);
                        setIsDeleteModalOpen(true);
                    }}
                />
            )
        },
        {
            id: "solicitacoes",
            label: `Solicitações (${initialRequests.length})`,
            icon: UserPlus,
            content: (
                <SolicitacoesTab
                    requests={initialRequests}
                    streamings={streamings}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    loading={loading}
                />
            )
        },
        {
            id: "convites",
            label: `Convites (${initialInvites.length})`,
            icon: Mail,
            content: (
                <ConvitesTab
                    invites={initialInvites}
                    onCancel={handleCancelInvite}
                    loading={loading}
                />
            )
        }
    ];

    return (
        <PageContainer>
            <PageHeader
                title="Participantes"
                description="Gerencie os membros e convites da sua conta"
                action={
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsInviteModalOpen(true)}
                            className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-2xl font-bold transition-all shadow-sm"
                        >
                            <Mail size={20} />
                            Convidar
                        </button>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 bg-primary hover:bg-accent text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/25 transition-all"
                        >
                            <Plus size={20} />
                            Direto
                        </button>
                    </div>
                }
            />

            <Tabs
                tabs={tabs}
                value={activeTabFromUrl}
                onValueChange={handleTabChange}
            />

            {/* Modals */}
            <ParticipantModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAdd}
                loading={loading}
            />

            <InviteModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onInvite={handleInvite}
                loading={loading}
                streamings={streamings}
            />

            <ParticipantModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleEdit}
                loading={loading}
                participant={
                    selectedParticipant
                        ? {
                            nome: selectedParticipant.nome,
                            whatsappNumero: selectedParticipant.whatsappNumero || "",
                            cpf: selectedParticipant.cpf ?? "",
                            email: selectedParticipant.email || "",
                        }
                        : undefined
                }
            />
            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                loading={loading}
                title="Excluir Participante"
                confirmDisabled={selectedParticipant ? selectedParticipant._count.assinaturas > 0 : false}
                message={
                    selectedParticipant && selectedParticipant._count.assinaturas > 0 ? (
                        <div className="flex flex-col gap-2">
                            <p className="font-medium text-gray-900">
                                Não é possível excluir {selectedParticipant.nome}
                            </p>
                            <p className="text-sm">
                                Este participante possui <strong className="text-red-600">{selectedParticipant._count.assinaturas} assinatura(s) ativa(s)</strong>.
                            </p>
                            <p className="text-sm text-gray-500">
                                O Administrador precisa encerrar as assinaturas primeiro e depois deletar.
                            </p>
                        </div>
                    ) : (
                        `Tem certeza que deseja excluir ${selectedParticipant?.nome}? Esta ação removerá o participante da base de dados.`
                    )
                }
            />
        </PageContainer>
    );
}
