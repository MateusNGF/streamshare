"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SlotCard } from "./slot-card";
import { RequestModal } from "./request-modal";
import { Search } from "lucide-react";

interface ExploreViewProps {
    initialStreamings: any[]; // Using any to avoid complex type duplication for now, but better to define interface
}

export function ExploreView({ initialStreamings }: ExploreViewProps) {
    const [streamings, setStreamings] = useState(initialStreamings);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStreaming, setSelectedStreaming] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredStreamings = streamings.filter(s =>
        s.catalogo.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.conta.nome.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRequest = (id: number) => {
        const streaming = streamings.find(s => s.id === id);
        if (streaming) {
            setSelectedStreaming(streaming);
            setIsModalOpen(true);
        }
    };

    return (
        <div className="container mx-auto py-8">
            <div className="mb-8 space-y-4">
                <h1 className="text-3xl font-bold">Encontre sua próxima assinatura</h1>
                <p className="text-muted-foreground">Vagas disponíveis em grupos compartilhados.</p>

                <div className="flex gap-4">
                    <div className="relative flex-grow max-w-md">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Buscar por Netflix, Spotify, HBO..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {filteredStreamings.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    Nenhuma vaga encontrada no momento.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredStreamings.map((streaming) => (
                        <SlotCard
                            key={streaming.id}
                            streaming={streaming}
                            onRequest={handleRequest}
                        />
                    ))}
                </div>
            )}

            <RequestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                streaming={selectedStreaming}
            />
        </div>
    );
}
