"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Toast, ToastVariant } from "@/components/ui/Toast";
import { CheckCircle2, XCircle, Clock, Search, Copy, Filter } from "lucide-react";

export function SaquesGlobalClient({ initialSaques }: { initialSaques: any[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("TODOS");
    const [toast, setToast] = useState<{ message: string, variant: ToastVariant } | null>(null);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setToast({ message: "Chave copiada!", variant: "success" });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'CONCLUIDO':
                return <span className="flex items-center gap-1.5 py-1 px-2.5 bg-green-50 text-green-600 text-xs font-bold rounded-full border border-green-100">
                    <CheckCircle2 size={12} /> Concluído
                </span>;
            case 'CANCELADO':
                return <span className="flex items-center gap-1.5 py-1 px-2.5 bg-red-50 text-red-600 text-xs font-bold rounded-full border border-red-100">
                    <XCircle size={12} /> Cancelado
                </span>;
            case 'PENDENTE':
                return <span className="flex items-center gap-1.5 py-1 px-2.5 bg-orange-50 text-orange-600 text-xs font-bold rounded-full border border-orange-100">
                    <Clock size={12} /> Pendente
                </span>;
            default:
                return <span className="py-1 px-2.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-full border border-gray-200">
                    {status}
                </span>;
        }
    };

    const filteredSaques = initialSaques.filter(saque => {
        const matchesSearch =
            saque.wallet.conta.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            saque.wallet.conta.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            saque.chavePixDestino.includes(searchTerm);

        const matchesStatus = statusFilter === "TODOS" || saque.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nome, e-mail ou chave PIX..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter size={18} className="text-gray-400" />
                    <select
                        className="bg-white border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-700"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="TODOS">Todos os Status</option>
                        <option value="PENDENTE">Apenas Pendentes</option>
                        <option value="CONCLUIDO">Apenas Concluídos</option>
                        <option value="CANCELADO">Apenas Cancelados</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Conta</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Chave PIX (Destino)</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Valor</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Data</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredSaques.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                                        Nenhum saque encontrado para os filtros aplicados.
                                    </td>
                                </tr>
                            ) : (
                                filteredSaques.map((saque) => (
                                    <tr key={saque.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="text-sm font-bold text-gray-900">{saque.wallet.conta.nome}</div>
                                            <div className="text-xs text-gray-500">{saque.wallet.conta.email}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {getStatusBadge(saque.status)}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-800">{saque.chavePixDestino}</span>
                                                <button
                                                    onClick={() => handleCopy(saque.chavePixDestino)}
                                                    className="text-primary hover:text-primary-hover p-1 rounded hover:bg-primary/10 transition-colors"
                                                >
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                            <div className="text-[10px] text-gray-400 mt-0.5 uppercase">
                                                {saque.tipoChaveDestino}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-black text-gray-900">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(saque.valor))}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-xs text-gray-500 font-medium">
                                                {format(new Date(saque.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                                            </div>
                                            <div className="text-[10px] text-gray-400">
                                                {format(new Date(saque.createdAt), "HH:mm", { locale: ptBR })}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    variant={toast.variant}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
