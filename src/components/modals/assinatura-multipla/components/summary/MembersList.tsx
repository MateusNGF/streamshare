"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ParticipanteOption, StreamingOption } from "../../types";
import { StreamingLogo } from "@/components/ui/StreamingLogo";

interface MembersListProps {
    participants: ParticipanteOption[];
    participantStreamings: Map<number, Set<number>>;
    selectedStreamings: StreamingOption[];
    totalSlots: number;
    receitaTotal: number;
    lucroTotal: number;
    formatCurrency: (val: number) => string;
}

export function MembersList({
    participants,
    participantStreamings,
    selectedStreamings,
    totalSlots,
    receitaTotal,
    lucroTotal,
    formatCurrency
}: MembersListProps) {
    const [isCollapsed, setIsCollapsed] = useState(true);
    if (participants.length === 0) return null;

    return (
        <div className="lg:col-span-12 animate-in fade-in slide-in-from-top-4 duration-500">
            <SectionHeader
                title="Membros do Lote"
                description="Lista de participantes incluídos e seus respectivos impactos financeiros."
                rightElement={
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 text-[10px] sm:text-[11px] font-black transition-all border border-gray-100 shrink-0"
                    >
                        {isCollapsed ? (
                            <>
                                <span className="hidden sm:inline">Mostrar Membros</span>
                                <span className="sm:hidden">Expandir</span>
                                <ChevronDown size={14} />
                            </>
                        ) : (
                            <>
                                <span className="hidden sm:inline">Ocultar Membros</span>
                                <span className="sm:hidden">Recolher</span>
                                <ChevronUp size={14} />
                            </>
                        )}
                    </button>
                }
            />

            {!isCollapsed && (
                <div className="bg-white rounded-[20px] border border-gray-100 shadow-sm overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="overflow-x-auto max-h-[350px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left min-w-[500px]">
                            <thead className="sticky top-0 bg-white z-10 shadow-sm">
                                <tr>
                                    <th className="px-5 py-3 text-[9px] font-black uppercase text-gray-400 border-b border-gray-100">Usuário</th>
                                    <th className="px-5 py-3 text-[9px] font-black uppercase text-gray-400 border-b border-gray-100 text-center">Serviços Selecionados</th>
                                    <th className="px-5 py-3 text-[9px] font-black uppercase text-gray-400 border-b border-gray-100 text-right">Faturamento</th>
                                    <th className="px-5 py-3 text-[9px] font-black uppercase text-gray-400 border-b border-gray-100 text-right">Contribuição Lucro</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {participants.map((p) => {
                                    const userRevenue = (receitaTotal / (totalSlots || 1)) * (p.quantidade || 1);
                                    const userProfit = (lucroTotal / (totalSlots || 1)) * (p.quantidade || 1);
                                    return (
                                        <tr key={p.id} className="hover:bg-primary/[0.02] transition-colors group">
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[11px] font-black text-gray-500 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                                                        {p.nome.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-black text-gray-800 leading-tight tracking-tight">{p.nome}</span>
                                                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter opacity-60">{p.whatsappNumero}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1 flex-wrap">
                                                    {selectedStreamings.map(s => {
                                                        const set = participantStreamings.get(p.id);
                                                        if (set && set.has(s.id)) {
                                                            return (
                                                                <div key={s.id} title={s.nome} className="w-6 h-6 rounded-md overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-200">
                                                                    <StreamingLogo name={s.nome} color={s.cor} iconeUrl={s.iconeUrl} size="sm" rounded="md" />
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-right font-black text-[11px] text-gray-900 whitespace-nowrap">
                                                {formatCurrency(userRevenue)}
                                            </td>
                                            <td className="px-5 py-3 text-right whitespace-nowrap">
                                                <span className="text-[10px] font-black text-green-600 bg-green-50 px-2.5 py-1 rounded-lg border border-green-100 tracking-tight">
                                                    +{formatCurrency(userProfit)}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
