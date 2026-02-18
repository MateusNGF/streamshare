"use client";

import { Mail, Clock, Trash2 } from "lucide-react";
import { PendingInvite } from "@/types/participante";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { cn } from "@/lib/utils";

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
                <div
                    key={inv.id}
                    className="group bg-white p-5 md:p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-[0_20px_50px_rgba(109,40,217,0.06)] hover:-translate-y-1 transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                    <div className="flex gap-5">
                        <div className="relative">
                            {inv.streaming ? (
                                <StreamingLogo
                                    name={inv.streaming.catalogo.nome}
                                    color={inv.streaming.catalogo.corPrimaria || "#000"}
                                    iconeUrl={inv.streaming.catalogo.iconeUrl}
                                    size="lg"
                                    rounded="2xl"
                                />
                            ) : (
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm border border-amber-100">
                                    <Mail size={24} />
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-lg shadow-md border border-gray-50 text-amber-500">
                                <Clock size={12} fill="currentColor" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h4 className="font-black text-gray-900 text-lg leading-tight group-hover:text-primary transition-colors">
                                    {inv.email}
                                </h4>
                                <span className="text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-100">
                                    Pendente
                                </span>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                {inv.streaming ? (
                                    <span>Vinculado a: <strong className="text-gray-600">{inv.streaming.apelido || inv.streaming.catalogo.nome}</strong></span>
                                ) : (
                                    "Convite de Acesso à Conta"
                                )}
                            </p>
                        </div>
                    </div>
                    <div>
                        <button
                            disabled={loading}
                            onClick={() => onCancel(inv.id)}
                            className="w-full md:w-auto px-6 py-3 text-red-600 font-bold hover:bg-red-50 rounded-2xl transition-all flex items-center justify-center gap-2 group/btn"
                        >
                            <Trash2 size={18} className="group-hover/btn:scale-110 transition-transform" />
                            Cancelar Convite
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
