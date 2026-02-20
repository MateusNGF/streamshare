"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowUpRight, ArrowDownRight, RefreshCcw } from "lucide-react";

interface Transaction {
    id: number;
    valor: string;
    tipo: string;
    status: string;
    descricao: string;
    createdAt: Date;
    referenciaGateway?: string;
}

export function WalletTransactionTable({ transactions }: { transactions: Transaction[] }) {
    if (!transactions || transactions.length === 0) {
        return (
            <div className="py-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <RefreshCcw size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Sem movimentações</h3>
                <p className="text-gray-500 mt-1 max-w-sm">
                    Nenhuma transação foi registrada na sua carteira ainda. Entradas e saídas aparecerão aqui.
                </p>
            </div>
        );
    }

    const formatCurrency = (val: string | number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));
    };

    const getIcon = (tipo: string, mapValue: boolean) => {
        switch (tipo) {
            case 'CREDITO_COTA':
            case 'ESTORNO':
                return mapValue ? <ArrowUpRight className="text-green-500" size={18} /> : null;
            case 'DEBITO_TAXA':
            case 'SAQUE':
                return mapValue ? <ArrowDownRight className="text-orange-500" size={18} /> : null;
            case 'CHARGEBACK':
                return mapValue ? <ArrowDownRight className="text-red-500" size={18} /> : null;
            default:
                return null;
        }
    };

    const getTypeLabel = (tipo: string) => {
        switch (tipo) {
            case 'CREDITO_COTA': return 'Pagamento Recebido';
            case 'DEBITO_TAXA': return 'Taxa StreamShare';
            case 'SAQUE': return 'Saque Realizado';
            case 'ESTORNO': return 'Estorno';
            case 'CHARGEBACK': return 'Chargeback';
            default: return tipo;
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'CONCLUIDO': return 'bg-green-100 text-green-700 border-green-200';
            case 'PENDENTE': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'FALHA':
            case 'CANCELADO': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const isPositive = (tipo: string, valor: number) => {
        return valor > 0;
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-[180px]">Data</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Descrição</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-[140px]">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right w-[150px]">Valor</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {transactions.map((tx) => {
                        const valorNum = Number(tx.valor);
                        const isIncome = isPositive(tx.tipo, valorNum);

                        return (
                            <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-semibold text-gray-900">
                                        {format(new Date(tx.createdAt), "dd MMM, yyyy", { locale: ptBR })}
                                    </div>
                                    <div className="text-xs text-gray-500 font-medium">
                                        {format(new Date(tx.createdAt), "HH:mm", { locale: ptBR })}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg flex-shrink-0 ${isIncome ? 'bg-green-50' : 'bg-red-50'}`}>
                                            {getIcon(tx.tipo, true)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900">{getTypeLabel(tx.tipo)}</div>
                                            <div className="text-xs text-gray-500">{tx.descricao}</div>
                                            {tx.referenciaGateway && (
                                                <div className="text-xs text-gray-400 font-mono mt-0.5" title="Gateway ID">
                                                    Ref: {tx.referenciaGateway.substring(0, 15)}...
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyles(tx.status)}`}>
                                        {tx.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <span className={`text-base font-bold ${isIncome ? 'text-green-600' : 'text-gray-900'}`}>
                                        {isIncome ? '+' : ''}{formatCurrency(valorNum)}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
