"use client";

import { useState, useRef } from "react";
import { Plus } from "lucide-react";
import { StreamingModal, StreamingFormData } from "@/components/modals/StreamingModal";
import { createStreaming } from "@/actions/streamings";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";

export function QuickActions() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const toast = useToast();

    const handleCreateStreaming = async (data: StreamingFormData) => {
        setLoading(true);
        try {
            await createStreaming({
                catalogoId: parseInt(data.catalogoId),
                apelido: data.apelido,
                valorIntegral: parseFloat(data.valorIntegral),
                limiteParticipantes: parseInt(data.limiteParticipantes),
            });

            toast.success("Streaming criado com sucesso!");
            setIsModalOpen(false);
            router.refresh(); // Refresh dashboard data
        } catch (error: any) {
            console.error(error);
            toast.error(error?.message || "Erro ao criar streaming");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <section className="mb-8">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Ações Rápidas</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-gray-100 rounded-[24px] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group"
                    >
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            <Plus size={24} />
                        </div>
                        <span className="font-bold text-gray-700 group-hover:text-primary transition-colors">Novo Streaming</span>
                    </button>

                    {/* Placeholder for future actions */}
                    {/* <div className="hidden md:flex flex-col items-center justify-center gap-3 p-6 bg-gray-50 border border-gray-100/50 rounded-[24px] opacity-50 cursor-not-allowed">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                            <Users2 size={24} />
                        </div>
                        <span className="font-bold text-gray-400">Gerenciar Grupos</span>
                    </div> */}
                </div>
            </section>

            <StreamingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleCreateStreaming}
                loading={loading}
            />
        </>
    );
}
