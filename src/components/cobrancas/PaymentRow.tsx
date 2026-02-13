'use client';

import { Calendar, User, CreditCard } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useCurrency } from "@/hooks/useCurrency";

interface PaymentRowProps {
    participant: string;
    streaming: string;
    value: number;
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
    const { format } = useCurrency();

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
                    {format(value)}
                </p>
                <div className="min-w-[90px] flex justify-center">
                    <StatusBadge status={status} />
                </div>
            </div>
        </div>
    );
}
