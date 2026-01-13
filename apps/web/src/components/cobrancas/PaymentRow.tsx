import { Calendar, User, CreditCard } from "lucide-react";

interface PaymentRowProps {
    participant: string;
    streaming: string;
    value: string;
    dueDate: string;
    status: "pago" | "pendente" | "atrasado";
}

export function PaymentRow({
    participant,
    streaming,
    value,
    dueDate,
    status,
}: PaymentRowProps) {
    const statusConfig = {
        pago: {
            bg: "bg-green-50",
            text: "text-green-600",
            label: "Pago",
        },
        pendente: {
            bg: "bg-amber-50",
            text: "text-amber-600",
            label: "Pendente",
        },
        atrasado: {
            bg: "bg-red-50",
            text: "text-red-600",
            label: "Atrasado",
        },
    };

    const config = statusConfig[status];

    return (
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100 hover:bg-gray-50 transition-all last:border-b-0">
            <div className="flex items-center gap-6 flex-1">
                <div className="flex items-center gap-3 min-w-[200px]">
                    <User size={16} className="text-primary" />
                    <span className="font-semibold text-gray-900">{participant}</span>
                </div>
                <div className="flex items-center gap-3 min-w-[150px]">
                    <CreditCard size={16} className="text-gray-400" />
                    <span className="text-gray-600">{streaming}</span>
                </div>
                <div className="flex items-center gap-3 min-w-[120px]">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-gray-600">{dueDate}</span>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <p className="text-lg font-bold text-gray-900 min-w-[100px] text-right">
                    R$ {value}
                </p>
                <span
                    className={`${config.bg} ${config.text} text-xs font-semibold px-3 py-1.5 rounded-full min-w-[90px] text-center`}
                >
                    {config.label}
                </span>
            </div>
        </div>
    );
}
