"use client";

import { useTransition } from "react";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { Users, CreditCard, ArrowRight } from "lucide-react";
import { requestParticipation } from "@/actions/requests";
import { useToast } from "@/hooks/useToast";
import { Spinner } from "@/components/ui/Spinner";

interface StreamingCardProps {
    streaming: {
        id: number;
        apelido: string | null;
        valorIntegral: number;
        limiteParticipantes: number;
        vagasDisponiveis: number;
        catalogo: {
            nome: string;
            iconeUrl: string | null;
            corPrimaria: string;
        };
        conta: {
            nome: string;
        };
    };
}

export function StreamingCard({ streaming }: StreamingCardProps) {
    const [isPending, startTransition] = useTransition();
    const toast = useToast();

    const handleRequest = () => {
        startTransition(async () => {
            try {
                await requestParticipation(streaming.id);
                toast.success("Solicitação enviada com sucesso! Aguarde aprovação.");
            } catch (error: any) {
                toast.error(error.message || "Erro ao solicitar participação");
            }
        });
    };

    const valorPorVaga = streaming.valorIntegral / streaming.limiteParticipantes;

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all group flex flex-col h-full">
            {/* Header com Cor do Catálogo */}
            <div
                className="h-2 w-full"
                style={{ backgroundColor: streaming.catalogo.corPrimaria }}
            />

            <div className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4 items-center">
                        <StreamingLogo
                            name={streaming.catalogo.nome}
                            color={streaming.catalogo.corPrimaria}
                            iconeUrl={streaming.catalogo.iconeUrl}
                            className="w-12 h-12 rounded-2xl shadow-sm group-hover:scale-110 transition-transform"
                        />
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg leading-tight">
                                {streaming.apelido || streaming.catalogo.nome}
                            </h3>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                                Host: {streaming.conta.nome}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 mb-8 flex-grow">
                    <div className="flex items-center gap-3 text-gray-600">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-primary">
                            <Users size={16} />
                        </div>
                        <span className="text-sm font-medium">
                            {streaming.vagasDisponiveis} vagas de {streaming.limiteParticipantes} totais
                        </span>
                    </div>

                    <div className="flex items-center gap-3 text-gray-600">
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-primary">
                            <CreditCard size={16} />
                        </div>
                        <span className="text-sm font-medium">
                            {valorPorVaga.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / mês
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleRequest}
                    disabled={isPending || streaming.vagasDisponiveis === 0}
                    className={`
                        w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all
                        ${streaming.vagasDisponiveis > 0
                            ? "bg-primary text-white shadow-lg shadow-primary/25 hover:bg-accent hover:-translate-y-0.5 active:translate-y-0"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"}
                        disabled:opacity-70
                    `}
                >
                    {isPending ? (
                        <>
                            <Spinner size="sm" color="white" />
                            Processando...
                        </>
                    ) : streaming.vagasDisponiveis > 0 ? (
                        <>
                            Solicitar Vaga
                            <ArrowRight size={18} />
                        </>
                    ) : (
                        "Sem Vagas"
                    )}
                </button>
            </div>
        </div>
    );
}
