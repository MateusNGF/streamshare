"use client";

import { Mail } from "lucide-react";
import { PendingInvite } from "@/types/participante";

interface Props {
    invites: PendingInvite[];
    onCancel: (id: string) => Promise<void>;
    loading: boolean;
}

export function ConvitesTab({ invites, onCancel, loading }: Props) {
    if (invites.length === 0) {
        return (
            <div className="text-center py-12 md:py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <p className="text-gray-400">Nenhum convite pendente encaminhado.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {invites.map((inv) => (
                <div key={inv.id} className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                            <Mail size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-gray-900">{inv.email}</h4>
                                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase">Pendente</span>
                            </div>
                            <p className="text-sm text-gray-500">
                                {inv.streaming ? `Vinculado a: ${inv.streaming.apelido || inv.streaming.catalogo.nome}` : "Apenas convite de conta"}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            disabled={loading}
                            onClick={() => onCancel(inv.id)}
                            className="px-4 py-2 text-red-600 font-semibold hover:bg-red-50 rounded-xl transition-all"
                        >
                            Cancelar Convite
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
