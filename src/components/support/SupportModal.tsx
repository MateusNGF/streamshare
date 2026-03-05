"use client";

import { useState } from "react";
import { MessageCircleQuestion, Send, Clock, BookOpen, ExternalLink, ArrowRight } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { TicketHistoryTable } from "./TicketHistoryTable";
import { useSupportForm } from "@/hooks/useSupportForm";
import { SupportHeader } from "./SupportHeader";
import { SupportFormFields } from "./SupportFormFields";
import { CentralAjudaTab } from "./CentralAjudaTab";

type SupportTab = 'docs' | 'ticket' | 'history';

interface SupportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
    const [activeTab, setActiveTab] = useState<SupportTab>('docs');

    const {
        formData,
        isPending,
        isLoggedIn,
        handleChange,
        handleSubmit
    } = useSupportForm({
        isOpen,
        onSuccess: () => {
            setActiveTab('docs');
            onClose();
        }
    });

    const renderFormContent = () => (
        <div className="space-y-6">
            <SupportHeader />
            <SupportFormFields
                formData={formData}
                onChange={handleChange}
                isPending={isPending}
                onSubmit={handleSubmit}
            />
        </div>
    );

    const tabs = [
        {
            id: 'docs',
            label: 'Central de Ajuda',
            icon: BookOpen,
            content: <CentralAjudaTab onOpenTicket={() => setActiveTab('ticket')} />
        },
        {
            id: 'ticket',
            label: 'Novo Chamado',
            icon: MessageCircleQuestion,
            content: renderFormContent()
        },
        {
            id: 'history',
            label: 'Meus Chamados',
            icon: Clock,
            content: (
                <div className="min-h-[300px]">
                    <TicketHistoryTable />
                </div>
            )
        }
    ];

    // Se o user não estiver logado, não vê as tabs, apenas o form ou o docs.
    // Vamos adaptar para ele ver pelo menos o Central de Ajuda.
    const notLoggedInContent = activeTab === 'docs'
        ? <CentralAjudaTab onOpenTicket={() => setActiveTab('ticket')} />
        : renderFormContent();

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Suporte Técnico"
            className="sm:max-w-2xl"
            footer={
                activeTab === 'ticket' ? (
                    <div className="flex gap-3 w-full">
                        <Button
                            type="button"
                            variant="ghost"
                            className="flex-1"
                            onClick={() => setActiveTab('docs')}
                            disabled={isPending}
                        >
                            Voltar
                        </Button>
                        <Button
                            type="submit"
                            form="support-form"
                            className="flex-[2] shadow-lg shadow-primary/25"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <span className="animate-spin mr-2">⏳</span>
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    Enviar Mensagem
                                    <Send size={18} className="ml-2" />
                                </>
                            )}
                        </Button>
                    </div>
                ) : activeTab === 'docs' ? (
                    <div className="w-full text-center">
                        <p className="text-sm text-gray-500">
                            Ao clicar em "Acessar Documentação", abrirá numa nova janela.
                        </p>
                    </div>
                ) : (
                    <Button
                        type="button"
                        variant="secondary"
                        className="w-full"
                        onClick={() => setActiveTab('ticket')}
                    >
                        <MessageCircleQuestion size={18} className="mr-2" />
                        Abrir Novo Chamado
                    </Button>
                )
            }
        >
            <div className="space-y-6">
                {isLoggedIn ? (
                    <Tabs
                        value={activeTab}
                        onValueChange={(val) => setActiveTab(val as SupportTab)}
                        tabs={tabs}
                    />
                ) : (
                    notLoggedInContent
                )}
            </div>
        </Modal>
    );
}
