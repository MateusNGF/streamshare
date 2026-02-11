import { Users, Calendar, DollarSign, Edit, Trash2 } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { StreamingLogo } from "@/components/ui/StreamingLogo";

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
    onEdit,
    onDelete,
}: StreamingDetailCardProps) {
    const { format } = useCurrency();
    const percentage = (slots.occupied / slots.total) * 100;
    const isNearFull = percentage >= 80;
    const available = slots.total - slots.occupied;

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <StreamingLogo
                        name={name}
                        color={color}
                        iconeUrl={iconeUrl}
                        size="lg"
                        rounded="2xl"
                        className="w-14 h-14 text-2xl shadow-lg"
                    />
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 text-base md:text-lg">{name}</h3>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={onEdit}
                                    aria-label={`Editar ${name}`}
                                    className="p-2 md:p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-primary transition-all touch-manipulation"
                                >
                                    <Edit size={20} className="md:w-4 md:h-4" />
                                </button>
                                <button
                                    onClick={onDelete}
                                    aria-label={`Excluir ${name}`}
                                    className="p-2 md:p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-red-500 transition-all touch-manipulation"
                                >
                                    <Trash2 size={20} className="md:w-4 md:h-4" />
                                </button>
                            </div>
                        </div>
                        {catalogName && catalogName !== name && (
                            <div className="text-xs text-gray-400">{catalogName}</div>
                        )}
                        <div className="text-sm text-gray-500">{frequency}</div>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users size={16} className="text-primary" />
                        <span>
                            {slots.occupied}/{slots.total} vagas • <span className="text-gray-500 font-normal">{available} disponíveis</span>
                        </span>
                    </div>
                    <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${isNearFull ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                            }`}
                    >
                        {percentage.toFixed(0)}%
                    </span>
                </div>

                <div
                    className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${slots.occupied} de ${slots.total} vagas ocupadas`}
                >
                    <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-bold text-gray-900">{format(typeof price === 'string' ? parseFloat(price) : price)}</span>
                        <span className="text-gray-400">/mês</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 justify-end">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="capitalize">{frequency}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
