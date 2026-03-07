"use client";

import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SupportFormFields } from "@/components/support/SupportFormFields";
import { SupportHeader } from "@/components/support/SupportHeader";

interface SupportCreateTicketPanelProps {
    onCancel: () => void;
    formData: any;
    handleChange: (e: any) => void;
    isPending: boolean;
    handleSubmit: (e: any) => void;
    isLoggedIn?: boolean;
}

export function SupportCreateTicketPanel({
    onCancel,
    formData,
    handleChange,
    isPending,
    handleSubmit,
    isLoggedIn,
}: SupportCreateTicketPanelProps) {
    return (
        <div className="space-y-6 bg-white p-8 rounded-3xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-right-8 duration-500 h-full flex flex-col">
            <div>
                <button
                    onClick={onCancel}
                    className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-full w-fit"
                >
                    <ArrowLeft size={16} />
                    Cancelar Abertura
                </button>
                <SupportHeader />
            </div>
            <form id="support-form" onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
                <div className="flex-1">
                    <SupportFormFields
                        formData={formData}
                        onChange={handleChange}
                        isPending={isPending}
                        onSubmit={handleSubmit}
                        isLoggedIn={isLoggedIn}
                    />
                </div>
                <div className="flex gap-4 pt-6 border-t border-gray-100 mt-auto">
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full shadow-lg shadow-violet-600/20 rounded-xl"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <><span className="animate-spin mr-2">⏳</span> Processando...</>
                        ) : (
                            <>Enviar Chamado <Send size={18} className="ml-2" /></>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
