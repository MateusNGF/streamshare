import { Users, Calendar, DollarSign, Edit, Trash2, Globe, Lock, Link, Copy, Check } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/useToast";

interface StreamingDetailCardProps {
    id: number;
    name: string;
    catalogName?: string;
    color: string;
    initial: string;
    iconeUrl?: string | null;
    slots: { occupied: number; total: number };
    price: number | string; // Changed to accept number/string for formatter
    frequency: string;
    isPublico?: boolean;
    publicToken?: string;
    onEdit: () => void;
    onDelete: () => void;
}

export function StreamingDetailCard({
    name,
    catalogName,
    color,
    initial,
    iconeUrl,
    slots,
    price,
    frequency,
    isPublico,
    publicToken,
    onEdit,
    onDelete,
}: StreamingDetailCardProps) {
    const { format } = useCurrency();
    const { success } = useToast();
    const [copied, setCopied] = useState(false);

    const percentage = (slots.occupied / slots.total) * 100;
    const isNearFull = percentage >= 80;
    const available = slots.total - slots.occupied;

    const copyPublicLink = () => {
        if (!publicToken) return;
        const url = `${window.location.origin}/assinar/${publicToken}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        success("Link público copiado!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white/70 backdrop-blur-md p-6 rounded-[32px] border border-white/20 shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all group relative overflow-hidden flex flex-col h-full hover:-translate-y-1 duration-300">
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <StreamingLogo
                            name={name}
                            color={color}
                            iconeUrl={iconeUrl}
                            size="lg"
                            rounded="2xl"
                            className="w-16 h-16 text-2xl shadow-xl z-10 relative"
                        />
                        <div
                            className="absolute inset-0 blur-2xl opacity-20 rounded-full -z-0"
                            style={{ backgroundColor: color }}
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 text-lg md:text-xl line-clamp-1">{name}</h3>
                            <Tooltip content={isPublico ? "Visível no Explorer" : "Privado (Oculto)"}>
                                <div className={cn(
                                    "p-1 rounded-full border transition-colors",
                                    isPublico ? "bg-primary/5 text-primary border-primary/20" : "bg-gray-50 text-gray-400 border-gray-100"
                                )}>
                                    {isPublico ? <Globe size={12} /> : <Lock size={12} />}
                                </div>
                            </Tooltip>
                        </div>
                        {catalogName && catalogName !== name && (
                            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">{catalogName}</div>
                        )}
                        <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-gray-50 rounded-lg border border-gray-100">
                            <Calendar size={12} className="text-gray-400" />
                            <span className="text-[10px] text-gray-500 font-bold uppercase">{frequency}</span>
                        </div>
                    </div>
                </div>

                <Tooltip content="Copiar link de inscrição">
                    <button
                        onClick={copyPublicLink}
                        className={cn(
                            "p-2 rounded-xl border transition-all flex items-center gap-2",
                            copied
                                ? "bg-green-50 text-green-600 border-green-200"
                                : "bg-white hover:bg-gray-50 text-gray-400 border-gray-100 hover:text-primary hover:border-primary/20"
                        )}
                    >
                        {copied ? <Check size={16} /> : <Link size={16} />}
                    </button>
                </Tooltip>
            </div>

            {/* Middle Section: Progress & Slots */}
            <div className="space-y-4 flex-1">
                <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                            <div className="p-1.5 bg-primary/10 rounded-lg">
                                <Users size={14} className="text-primary" />
                            </div>
                            <span className="text-sm font-bold text-gray-700">
                                {slots.occupied}/{slots.total} <span className="text-gray-400 font-medium text-xs ml-1">vagas ocupadas</span>
                            </span>
                        </div>
                        <span
                            className={cn(
                                "text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider",
                                isNearFull ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600"
                            )}
                        >
                            {percentage.toFixed(0)}%
                        </span>
                    </div>

                    <div
                        className="w-full h-3 bg-gray-50 rounded-full border border-gray-100 p-0.5 overflow-hidden"
                        role="progressbar"
                        aria-valuenow={percentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    >
                        <div
                            className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                            style={{
                                width: `${percentage}%`,
                                backgroundColor: color || 'var(--primary)',
                                backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)'
                            }}
                        />
                    </div>

                    <div className="flex items-center justify-between py-1 px-3 bg-gray-50/50 rounded-xl border border-gray-100/50">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Valor por vaga</span>
                        <span className="text-[11px] text-primary font-black">
                            {format((typeof price === 'string' ? parseFloat(price) : price) / slots.total)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Financial & Quick Actions */}
            <div className="mt-6 pt-5 border-t border-gray-100/60 flex items-center justify-between">
                <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Valor Integral</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-gray-900 tracking-tight">
                            {format(typeof price === 'string' ? parseFloat(price) : price)}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">/mês</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onEdit}
                        aria-label={`Editar ${name}`}
                        className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-primary hover:text-white rounded-xl text-gray-400 transition-all hover:shadow-lg hover:shadow-primary/20"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={onDelete}
                        aria-label={`Excluir ${name}`}
                        className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-red-500 hover:text-white rounded-xl text-gray-400 transition-all hover:shadow-lg hover:shadow-red-500/20"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
