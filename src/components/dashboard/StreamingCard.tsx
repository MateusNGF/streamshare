'use client';

import { MoreVertical } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { StreamingLogo } from "@/components/ui/streaming-logo";

interface StreamingCardProps {
    name: string;
    slots: { occupied: number; total: number };
    value: number;
    color: string;
    initial: string;
    iconeUrl?: string | null;
}

export function StreamingCard({ name, slots, value, color, initial, iconeUrl }: StreamingCardProps) {
    const percentage = (slots.occupied / slots.total) * 100;
    const { format } = useCurrency();

    return (
        <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all group">
            <div className="flex items-center gap-4">
                <div className="relative group/actions">
                    <StreamingLogo
                        name={name}
                        color={color}
                        iconeUrl={iconeUrl}
                        size="lg"
                        rounded="2xl"
                        className="shadow-lg"
                    />
                    <button className="absolute -top-1 -right-1 p-1 bg-white shadow-md rounded-full text-gray-400 hover:text-gray-900 border border-gray-100 opacity-0 group-hover/actions:opacity-100 transition-all">
                        <MoreVertical size={14} />
                    </button>
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 leading-tight mb-0.5">{name}</h4>
                    <p className="text-[11px] font-medium text-gray-500 flex items-center gap-1.5 uppercase tracking-wider">
                        <span>{slots.occupied}/{slots.total} vagas</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className="text-primary font-black">{format(value)} <small className="text-[9px] font-medium opacity-70">/mês</small></span>
                    </p>
                    <div className="w-full md:w-48 h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden shadow-inner">
                        <div
                            className="h-full bg-primary shadow-[0_0_8px_rgba(109,40,217,0.4)] transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
