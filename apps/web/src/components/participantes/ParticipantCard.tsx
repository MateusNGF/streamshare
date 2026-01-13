import { Phone, Mail, CreditCard } from "lucide-react";

interface ParticipantCardProps {
    name: string;
    whatsapp: string;
    email?: string;
    cpf: string;
    subscriptionsCount: number;
    totalValue: string;
    status: "ativa" | "suspensa";
}

export function ParticipantCard({
    name,
    whatsapp,
    email,
    cpf,
    subscriptionsCount,
    totalValue,
    status,
}: ParticipantCardProps) {
    const initial = name.charAt(0).toUpperCase();

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-violet-100 text-primary flex items-center justify-center font-bold text-xl">
                        {initial}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">{name}</h3>
                        <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full ${status === "ativa"
                                    ? "bg-green-50 text-green-600"
                                    : "bg-red-50 text-red-600"
                                }`}
                        >
                            {status === "ativa" ? "● Ativa" : "● Suspensa"}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Valor Total</p>
                    <p className="text-xl font-bold text-gray-900">R$ {totalValue}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={16} className="text-primary" />
                    <span>{whatsapp}</span>
                </div>
                {email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={16} className="text-primary" />
                        <span>{email}</span>
                    </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CreditCard size={16} className="text-primary" />
                    <span>{subscriptionsCount} assinatura{subscriptionsCount !== 1 ? "s" : ""}</span>
                </div>
            </div>
        </div>
    );
}
