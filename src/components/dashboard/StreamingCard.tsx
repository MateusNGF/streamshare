'use client';

import { MoreVertical } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { StreamingLogo } from "@/components/ui/StreamingLogo";

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
                <StreamingLogo
                    name={name}
                    color={color}
                    iconeUrl={iconeUrl}
                    size="lg"
                    rounded="2xl"
                    className="shadow-lg"
                />
                <div>
                    <h4 className="font-semibold text-gray-900">{name}</h4>
                    <p className="text-sm text-gray-500">{slots.occupied}/{slots.total} vagas • {format(value)}</p>
                    <div className="w-48 h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                        <div
                            className="h-full bg-primary"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </div>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-white border border-transparent hover:border-gray-100 transition-all">
                <MoreVertical size={20} />
            </button>
        </div>
    );
}
