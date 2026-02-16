"use client";

import { useState } from "react";
import { StreamingCard } from "./StreamingCard";
import { AddMemberModal } from "@/components/modals/AddMemberModal";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface DashboardStreamingListProps {
    streamings: any[];
}

export function DashboardStreamingList({ streamings }: DashboardStreamingListProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStreamingId, setSelectedStreamingId] = useState<number | undefined>();
    const [initialTab, setInitialTab] = useState<"email" | "link">("email");

    const handleAction = (action: 'invite' | 'share', id: number) => {
        setSelectedStreamingId(id);
        setInitialTab(action === 'invite' ? 'email' : 'link');
        setIsModalOpen(true);
    };

    return (
        <section className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Meus Streamings</h2>
                <Link href="/streamings" className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                    Ver Todos <ChevronRight size={16} />
                </Link>
            </div>
            <div className="space-y-2">
                {streamings.length > 0 ? (
                    streamings.map((s) => (
                        <StreamingCard
                            key={s.id}
                            id={s.id}
                            name={s.apelido || s.catalogo.nome}
                            initial={s.catalogo.nome.charAt(0).toUpperCase()}
                            color={s.catalogo.corPrimaria}
                            iconeUrl={s.catalogo.iconeUrl}
                            slots={{ occupied: s._count.assinaturas, total: s.limiteParticipantes }}
                            value={s.valorIntegral.toNumber ? s.valorIntegral.toNumber() : s.valorIntegral}
                            onAction={handleAction}
                        />
                    ))
                ) : (
                    <p className="text-gray-400 text-center py-4 text-sm">Nenhum streaming cadastrado.</p>
                )}
            </div>

            <AddMemberModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                streamings={streamings}
                initialStreamingId={selectedStreamingId}
                initialTab={initialTab}
            />
        </section>
    );
}
