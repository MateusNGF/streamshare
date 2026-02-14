"use client";

import { useState } from "react";
import { HelpCircle, MessageCircleQuestion, Send, Clock } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { TicketHistoryTable } from "./TicketHistoryTable";
import { useSupportForm } from "@/hooks/useSupportForm";
import { SupportHeader } from "./SupportHeader";
import { SupportFormFields } from "./SupportFormFields";

type SupportTab = 'new' | 'history';

export function SupportButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<SupportTab>('new');

    const {
        formData,
        isPending,
        isLoggedIn,
        handleChange,
        handleSubmit
    } = useSupportForm({
        isOpen,
        onSuccess: () => setIsOpen(false)
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
            id: 'new',
            label: 'Nova Mensagem',
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

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 p-4 bg-primary text-white rounded-full shadow-lg shadow-primary/30 hover:shadow-xl hover:scale-110 hover:-translate-y-1 transition-all duration-300 z-40 group animate-in fade-in zoom-in slide-in-from-bottom-5"
                aria-label="Suporte"
            >
                <HelpCircle size={28} className="group-hover:rotate-12 transition-transform" />
            </button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Central de Ajuda"
                className="sm:max-w-2xl"
                footer={
                    activeTab === 'new' ? (
                        <div className="flex gap-3 w-full">
                            <Button
                                type="button"
                                variant="ghost"
                                className="flex-1"
                                onClick={() => setIsOpen(false)}
                                disabled={isPending}
                            >
                                Cancelar
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
                    ) : (
                        <Button
                            type="button"
                            variant="secondary"
                            className="w-full"
                            onClick={() => setActiveTab('new')}
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
                        renderFormContent()
                    )}
                </div>
            </Modal>
        </>
    );
}

