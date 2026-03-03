"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertCircle, Check, Clock, MessageSquare, XCircle, SearchX } from "lucide-react";
import { getUserReports } from "@/actions/suporte";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { useToast } from "@/hooks/useToast";
import { EmptyState } from "@/components/ui/EmptyState";

export function TicketHistoryTable() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const result = await getUserReports();
                if (result.success && result.data) {
                    setTickets(result.data);
                } else {
                    toast.error(result.error || "Erro ao carregar histórico.");
                }
            } catch (error) {
                toast.error("Erro de conexão ao buscar chamados.");
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, []);

    if (loading) {
        return <TableSkeleton rows={5} columns={3} />;
    }

    if (tickets.length === 0) {
        return (
            <div className="py-8 min-h-[300px] flex items-center justify-center">
                <EmptyState
                    icon={MessageSquare}
                    title="Nenhum chamado"
                    description="Você ainda não abriu nenhum chamado de suporte."
                    variant="default"
                />
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assunto</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {tickets.map((ticket) => (
                            <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {format(new Date(ticket.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-medium text-gray-900 block mb-0.5 group-hover:text-primary transition-colors">
                                        {ticket.assunto}
                                    </span>
                                    <p className="text-xs text-gray-500 line-clamp-1 max-w-[200px]" title={ticket.descricao}>
                                        {ticket.descricao}
                                    </p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={ticket.status} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
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
            icon: Check,
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
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${color}`}>
            <Icon size={12} />
            {label}
        </span>
    );
}
