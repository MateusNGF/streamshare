"use client";

import { QrCode, CreditCard } from "lucide-react";

type MetodoPagamento = 'PIX' | 'CREDIT_CARD';

interface PaymentMethodSelectorProps {
    value: MetodoPagamento;
    onChange: (value: MetodoPagamento) => void;
    label?: string;
}

const methods: { id: MetodoPagamento; label: string; icon: typeof QrCode }[] = [
    { id: 'PIX', label: 'PIX', icon: QrCode },
    { id: 'CREDIT_CARD', label: 'Cartão', icon: CreditCard },
];

export function PaymentMethodSelector({ value, onChange, label = "Método de Pagamento" }: PaymentMethodSelectorProps) {
    return (
        <div className="space-y-3">
            {label && (
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                    {label}
                </label>
            )}
            <div className="grid grid-cols-2 gap-3">
                {methods.map((method) => {
                    const Icon = method.icon;
                    const isSelected = value === method.id;

                    return (
                        <button
                            key={method.id}
                            type="button"
                            onClick={() => onChange(method.id)}
                            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${isSelected
                                ? 'border-primary bg-primary/[0.03] text-primary shadow-lg shadow-primary/5'
                                : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                                }`}
                        >
                            <Icon size={24} className={isSelected ? 'opacity-100' : 'opacity-40'} />
                            <span className="text-xs font-black uppercase tracking-wider">{method.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
