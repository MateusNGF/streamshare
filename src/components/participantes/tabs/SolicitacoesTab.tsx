"use client";

import { UserPlus, Check, X, Mail as MailIcon } from "lucide-react";
import { PendingRequest, Streaming } from "@/types/participante";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { cn } from "@/lib/utils";

interface Props {
    requests: PendingRequest[];
    streamings: Streaming[];
    onApprove: (id: string) => Promise<void>; // Agora é string e não precisa de streamingId
    onReject: (id: string) => Promise<void>; // Agora é string
    loading: boolean;
}

export function SolicitacoesTab({ requests, streamings, onApprove, onReject, loading }: Props) {
    if (requests.length === 0) {
        return (
            <div className="text-center py-12 md:py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400">Nenhuma solicitação pendente.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {requests.map((req) => (
                <div
                    key={req.id}
                    className="group bg-white p-5 md:p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-[0_20px_50px_rgba(59,130,246,0.06)] hover:-translate-y-1 transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                    <div className="flex gap-5">
                        <div className="relative">
                            {req.streaming ? (
                                <StreamingLogo
                                    name={req.streaming.catalogo.nome}
                                    color={req.streaming.catalogo.corPrimaria || "#000"}
                                    iconeUrl={req.streaming.catalogo.iconeUrl}
                                    size="lg"
                                    rounded="2xl"
                                />
                            ) : (
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm border border-blue-100">
                                    <UserPlus size={24} />
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-lg shadow-md border border-gray-50 text-blue-500">
                                <UserPlus size={12} fill="currentColor" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-black text-gray-900 text-lg leading-tight group-hover:text-primary transition-colors">
                                {req.usuario?.nome || "Usuário"}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                                    {req.usuario?.email || req.email}
                                </span>
                                {req.streaming && (
                                    <span className="text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">
                                        Solicitou: {req.streaming.apelido || req.streaming.catalogo.nome}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            disabled={loading}
                            onClick={() => onReject(req.id)}
                            className="flex-1 md:flex-none px-6 py-3 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center gap-2"
                        >
                            <X size={18} /> Recusar
                        </button>

                        <button
                            disabled={loading}
                            onClick={() => onApprove(req.id)}
                            className="flex-1 md:flex-none px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-accent hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
                        >
                            <Check size={18} /> Aprovar
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
