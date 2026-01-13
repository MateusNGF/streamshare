import { Users, Calendar, DollarSign, MoreVertical } from "lucide-react";

interface StreamingDetailCardProps {
    name: string;
    color: string;
    initial: string;
    slots: { occupied: number; total: number };
    price: string;
    dueDate: string;
    frequency: string;
}

export function StreamingDetailCard({
    name,
    color,
    initial,
    slots,
    price,
    dueDate,
    frequency,
}: StreamingDetailCardProps) {
    const percentage = (slots.occupied / slots.total) * 100;
    const isNearFull = percentage >= 80;

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg"
                        style={{ backgroundColor: color }}
                    >
                        {initial}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">{name}</h3>
                        <p className="text-sm text-gray-500">{frequency}</p>
                    </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-50 transition-all">
                    <MoreVertical size={20} />
                </button>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users size={16} className="text-primary" />
                        <span>
                            {slots.occupied}/{slots.total} vagas ocupadas
                        </span>
                    </div>
                    <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${isNearFull ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                            }`}
                    >
                        {percentage.toFixed(0)}%
                    </span>
                </div>

                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign size={16} className="text-primary" />
                        <span>R$ {price}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={16} className="text-primary" />
                        <span>Venc: {dueDate}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
