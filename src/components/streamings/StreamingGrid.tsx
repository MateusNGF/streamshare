"use client";

import { Search } from "lucide-react";
import { StreamingDetailCard } from "@/components/streamings/StreamingDetailCard";
import { EmptyState } from "@/components/ui/EmptyState";

interface StreamingGridProps {
    streamings: any[];
    isLoading: boolean;
    searchTerm: string;
    onEdit: (streaming: any) => void;
    onDelete: (streaming: any) => void;
}

export function StreamingGrid({ streamings, isLoading, searchTerm, onEdit, onDelete }: StreamingGridProps) {
    if (isLoading && streamings.length === 0) {
        return (
            <div className="text-center py-12 md:py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-gray-600 mt-4">Carregando streamings...</p>
            </div>
        );
    }

    if (streamings.length === 0) {
        return (
            <EmptyState
                icon={Search}
                title="Nenhum serviço encontrado"
                description={searchTerm
                    ? "Não encontramos nenhum serviço com o termo pesquisado."
                    : "Você ainda não cadastrou nenhum serviço de streaming."}
            />
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {streamings
                .filter((s) => s.catalogo)
                .map((s) => (
                    <StreamingDetailCard
                        key={s.id}
                        id={s.id}
                        name={s.apelido || s.catalogo.nome}
                        catalogName={s.catalogo.nome}
                        color={s.catalogo.corPrimaria}
                        initial={(s.apelido || s.catalogo.nome).charAt(0).toUpperCase()}
                        iconeUrl={s.catalogo.iconeUrl}
                        slots={{ occupied: s._count?.assinaturas || 0, total: s.limiteParticipantes }}
                        price={s.valorIntegral}
                        frequency="Mensal"
                        isPublico={s.isPublico}
                        publicToken={s.publicToken}
                        onEdit={() => onEdit(s)}
                        onDelete={() => onDelete(s)}
                    />
                ))}
        </div>
    );
}
