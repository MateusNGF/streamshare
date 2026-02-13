"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertCircle, Check, Clock, MessageSquare, RefreshCw, XCircle } from "lucide-react";
import { getUserReports } from "@/actions/suporte";

export function TicketHistoryTable() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            const result = await getUserReports();
            if (result.success && result.data) {
                setTickets(result.data);
            }
            setLoading(false);
        };

        fetchTickets();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <RefreshCw className="animate-spin text-gray-400" size={24} />
            </div>
        );
    }

    if (tickets.length === 0) {
        return (
            <div className="text-center p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <MessageSquare className="mx-auto text-gray-300 mb-2" size={32} />
                <p className="text-gray-500 font-medium">Você ainda não abriu nenhum chamado.</p>
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
                            <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {format(new Date(ticket.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-medium text-gray-900 block mb-0.5">{ticket.assunto}</span>
                                    <p className="text-xs text-gray-500 line-clamp-1 max-w-[200px]">{ticket.descricao}</p>
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
    const styles = {
        pendente: "bg-yellow-50 text-yellow-700 border-yellow-100",
        em_analise: "bg-blue-50 text-blue-700 border-blue-100",
        resolvido: "bg-green-50 text-green-700 border-green-100",
        finalizado: "bg-gray-50 text-gray-600 border-gray-100",
    };

    const icons = {
        pendente: AlertCircle,
        em_analise: Clock,
        resolvido: Check,
        finalizado: XCircle,
    };

    const labels = {
        pendente: "Pendente",
        em_analise: "Em Análise",
        resolvido: "Resolvido",
        finalizado: "Finalizado",
    };

    const StatusIcon = icons[status as keyof typeof icons] || AlertCircle;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || "bg-gray-50 text-gray-600 border-gray-100"}`}>
            <StatusIcon size={12} />
            {labels[status as keyof typeof labels] || status}
        </span>
    );
}
