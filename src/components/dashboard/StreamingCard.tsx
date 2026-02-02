import { MoreVertical } from "lucide-react";

interface StreamingCardProps {
    name: string;
    slots: { occupied: number; total: number };
    value: string;
    color: string;
    initial: string;
    iconeUrl?: string | null;
}

export function StreamingCard({ name, slots, value, color, initial, iconeUrl }: StreamingCardProps) {
    const percentage = (slots.occupied / slots.total) * 100;

    return (
        <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all group">
            <div className="flex items-center gap-4">
                <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                    style={{ backgroundColor: color }}
                >
                    {iconeUrl ? (
                        <img src={iconeUrl} alt={name} className="w-8 h-8 object-contain brightness-0 invert" />
                    ) : (
                        initial
                    )}
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900">{name}</h4>
                    <p className="text-sm text-gray-500">{slots.occupied}/{slots.total} vagas • R$ {value}</p>
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
