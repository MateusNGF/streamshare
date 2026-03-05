"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, MessageCircleQuestion, Clock, Send, ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SupportFormFields } from "@/components/support/SupportFormFields";
import { SupportHeader } from "@/components/support/SupportHeader";
import { TicketHistoryTable } from "@/components/support/TicketHistoryTable";
import { useSupportPageForm } from "@/hooks/useSupportPageForm";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

type ActiveView = "home" | "novo" | "historico";

export function ChamadosClient() {
    const [activeView, setActiveView] = useState<ActiveView>("home");

    const { formData, isPending, handleChange, handleSubmit } = useSupportPageForm({
        onSuccess: () => setActiveView("historico"),
    });

    return (
        <PageContainer>
            <PageHeader
                title="Suporte"
                description="Consulte a documentação ou abra um chamado para a nossa equipa."
            />

            <div className="mt-6 max-w-3xl">
                {activeView === "home" && (
                    <div className="space-y-5">
                        {/* Docs Banner — prioridade visual */}
                        <div className="bg-gradient-to-br from-violet-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg shadow-violet-600/20">
                            <div className="flex items-start gap-4">
                                <div className="bg-white/15 p-3 rounded-xl shrink-0">
                                    <BookOpen size={28} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-xl font-bold mb-1">Central de Ajuda</h2>
                                    <p className="text-violet-100 text-sm leading-relaxed mb-4">
                                        Antes de abrir um chamado, confira se a sua dúvida já está respondida na nossa documentação. Cobrimos pagamentos, assinaturas, convites e muito mais.
                                    </p>
                                    <Link href="/docs">
                                        <Button
                                            size="sm"
                                            className="bg-white text-violet-700 hover:bg-violet-50 border-0 font-semibold shadow-none"
                                        >
                                            Acessar Documentação
                                            <ExternalLink size={15} className="ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-gray-50 px-4 text-sm text-gray-400">
                                    não encontrou o que precisava?
                                </span>
                            </div>
                        </div>

                        {/* Secondary actions */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => setActiveView("novo")}
                                className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl hover:border-violet-300 hover:shadow-md hover:shadow-violet-500/5 transition-all duration-200 text-left group"
                            >
                                <div className="bg-violet-50 p-3 rounded-xl group-hover:bg-violet-100 transition-colors shrink-0">
                                    <MessageCircleQuestion size={22} className="text-violet-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">Abrir Chamado</p>
                                    <p className="text-sm text-gray-500">Fale com a nossa equipa</p>
                                </div>
                            </button>

                            <button
                                onClick={() => setActiveView("historico")}
                                className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl hover:border-violet-300 hover:shadow-md hover:shadow-violet-500/5 transition-all duration-200 text-left group"
                            >
                                <div className="bg-gray-50 p-3 rounded-xl group-hover:bg-gray-100 transition-colors shrink-0">
                                    <Clock size={22} className="text-gray-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">Meus Chamados</p>
                                    <p className="text-sm text-gray-500">Ver histórico de tickets</p>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {activeView === "novo" && (
                    <div className="space-y-6">
                        <button
                            onClick={() => setActiveView("home")}
                            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Voltar
                        </button>

                        <SupportHeader />
                        <SupportFormFields
                            formData={formData}
                            onChange={handleChange}
                            isPending={isPending}
                            onSubmit={handleSubmit}
                        />

                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setActiveView("home")}
                                disabled={isPending}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                form="support-form"
                                className="flex-1 shadow-lg shadow-primary/20"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <><span className="animate-spin mr-2">⏳</span> Enviando...</>
                                ) : (
                                    <> Enviar Mensagem <Send size={16} className="ml-2" /></>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {activeView === "historico" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setActiveView("home")}
                                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeft size={16} />
                                Voltar
                            </button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setActiveView("novo")}
                            >
                                <MessageCircleQuestion size={15} className="mr-1.5" />
                                Novo Chamado
                            </Button>
                        </div>
                        <TicketHistoryTable />
                    </div>
                )}
            </div>
        </PageContainer>
    );
}
