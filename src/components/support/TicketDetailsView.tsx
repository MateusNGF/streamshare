"use client";

import { MessageSquare, Clock, Calendar, CheckCircle2, ChevronRight, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/Button";

interface TicketDetailsViewProps {
    ticket: any;
    onClose: () => void;
}

export function TicketDetailsView({ ticket, onClose }: TicketDetailsViewProps) {
    if (!ticket) return null;

    const StatusBadge = ({ status }: { status: string }) => {
        const config = {
            pendente: {
                color: "bg-yellow-50 text-yellow-700 border-yellow-200",
                icon: AlertCircle,
                label: "Pendente"
            },
            em_analise: {
                color: "bg-blue-50 text-blue-700 border-blue-200",
                icon: Clock,
                label: "Em Análise"
            },
            resolvido: {
                color: "bg-green-50 text-green-700 border-green-200",
                icon: CheckCircle2,
                label: "Resolvido"
            },
            finalizado: {
                color: "bg-gray-50 text-gray-600 border-gray-200",
                icon: XCircle,
                label: "Finalizado"
            },
            default: {
                color: "bg-gray-50 text-gray-600 border-gray-200",
                icon: AlertCircle,
                label: status
            }
        };

        const { color, icon: Icon, label } = config[status as keyof typeof config] || config.default;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${color}`}>
                <Icon size={14} />
                {label}
            </span>
        );
    };

    return (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-right-4 duration-500 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <button onClick={onClose} className="hover:text-gray-900 transition-colors">Chamados</button>
                    <ChevronRight size={14} />
                    <span className="font-medium text-gray-900 truncate max-w-[150px]">{ticket.assunto}</span>
                </div>
                <StatusBadge status={ticket.status} />
            </div>

            <div className="space-y-6 flex-1">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{ticket.assunto}</h2>
                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500 bg-gray-50 p-3 rounded-xl w-fit">
                        <span className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-gray-400" />
                            Aberto em {format(new Date(ticket.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                            <Clock size={14} className="text-gray-400" />
                            {format(new Date(ticket.createdAt), "HH:mm", { locale: ptBR })}
                        </span>
                    </div>
                </div>

                <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <MessageSquare size={16} className="text-gray-400" />
                        Mensagem Original
                    </h3>
                    <p className="text-gray-600 whitespace-pre-wrap leading-relaxed text-sm">
                        {ticket.descricao}
                    </p>
                </div>

                {/* Futuramente, lista de interações/respostas entraria aqui */}
                <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-center text-gray-400 gap-2">
                    <Clock size={16} />
                    <span className="text-sm">Aguardando resposta da equipa caso necessário.</span>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 pb-2">
                <Button variant="outline" onClick={onClose} className="w-full">
                    Voltar para a Lista
                </Button>
            </div>
        </div>
    );
}
