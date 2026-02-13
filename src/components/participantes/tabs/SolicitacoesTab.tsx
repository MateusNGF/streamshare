"use client";

import { UserPlus, Check, X } from "lucide-react";
import { PendingRequest, Streaming } from "@/types/participante";

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
                <div key={req.id} className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <UserPlus size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">{req.usuario?.nome || "Usuário"}</h4>
                            <p className="text-sm text-gray-500">
                                {req.usuario?.email || req.email} •
                                {req.streaming ? (
                                    <span className="text-primary font-medium"> Solicitou {req.streaming.apelido || req.streaming.catalogo.nome}</span>
                                ) : (
                                    " Solicitou entrada"
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            disabled={loading}
                            onClick={() => onReject(req.id)}
                            className="flex-1 md:flex-none px-4 py-2 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                        >
                            <X size={16} /> Recusar
                        </button>

                        <button
                            disabled={loading}
                            onClick={() => onApprove(req.id)}
                            className="flex-1 md:flex-none px-6 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-accent transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                        >
                            <Check size={16} /> Aprovar
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
