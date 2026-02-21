"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    ArrowUpRight,
    ArrowDownRight,
    RefreshCcw,
    DollarSign,
    Calendar,
    Hash,
    Activity,
    Lock,
    Unlock,
    Search,
    ChevronRight
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

interface Transaction {
    id: number;
    valor: string;
    tipo: string;
    status: string;
    descricao: string;
    createdAt: Date;
    referenciaGateway?: string;
    isLiberado: boolean;
}

export function WalletTransactionTable({ transactions }: { transactions: Transaction[] }) {
    if (!transactions || transactions.length === 0) {
        return (
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden p-12">
                <EmptyState
                    icon={RefreshCcw}
                    title="Sem movimentações"
                    description="Nenhuma transação foi registrada na sua carteira ainda. Entradas e saídas aparecerão aqui."
                    className="bg-transparent border-none py-12"
                />
            </div>
        );
    }

    const formatCurrency = (val: string | number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));
    };

    const getIcon = (tipo: string) => {
        switch (tipo) {
            case 'CREDITO_COTA':
            case 'ESTORNO':
                return <ArrowUpRight className="text-green-500" size={16} />;
            case 'DEBITO_TAXA':
            case 'SAQUE':
                return <ArrowDownRight className="text-orange-500" size={16} />;
            case 'CHARGEBACK':
                return <ArrowDownRight className="text-red-500" size={16} />;
            default:
                return <Activity className="text-gray-400" size={16} />;
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

    return (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="hover:bg-transparent border-b border-gray-100">
                            <TableHead className="w-[80px] text-center text-[10px] font-black text-gray-400 uppercase tracking-widest py-5">
                                <div className="flex items-center justify-center gap-1">
                                    <Hash size={10} />
                                    ID
                                </div>
                            </TableHead>
                            <TableHead className="text-[10px] font-black text-gray-500 uppercase tracking-widest min-w-[140px]">
                                <div className="flex items-center gap-2">
                                    <Calendar size={12} className="text-gray-400" />
                                    Data
                                </div>
                            </TableHead>
                            <TableHead className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <Activity size={12} className="text-gray-400" />
                                    Descrição
                                </div>
                            </TableHead>
                            <TableHead className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <Search size={12} className="text-gray-400" />
                                    Referência
                                </div>
                            </TableHead>
                            <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-widest w-[130px]">
                                Disponibilidade
                            </TableHead>
                            <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-widest w-[110px]">
                                Status
                            </TableHead>
                            <TableHead className="text-right text-[10px] font-black text-gray-500 uppercase tracking-widest px-8 min-w-[140px]">
                                <div className="flex items-center justify-end gap-2">
                                    <DollarSign size={12} className="text-gray-400" />
                                    Valor
                                </div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((tx, index) => {
                            const valorNum = Number(tx.valor);
                            const isIncome = valorNum > 0;

                            return (
                                <TableRow
                                    key={tx.id}
                                    className="group animate-in fade-in slide-in-from-left-4 duration-500 fill-mode-both hover:bg-gray-50/40 transition-all border-b border-gray-50 last:border-0"
                                    style={{ animationDelay: `${index * 30}ms` }}
                                >
                                    <TableCell className="text-center">
                                        <span className="text-[10px] font-mono font-bold text-gray-400">
                                            #{tx.id}
                                        </span>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-gray-900 leading-tight">
                                                {format(new Date(tx.createdAt), "dd MMM, yyyy", { locale: ptBR })}
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5">
                                                {format(new Date(tx.createdAt), "HH:mm:ss", { locale: ptBR })}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                                                isIncome ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                                            )}>
                                                {getIcon(tx.tipo)}
                                            </div>
                                            <div className="flex flex-col max-w-[200px]">
                                                <span className="text-sm font-black text-gray-900 leading-tight truncate">
                                                    {getTypeLabel(tx.tipo)}
                                                </span>
                                                <span className="text-[11px] text-gray-500 font-medium truncate" title={tx.descricao}>
                                                    {tx.descricao}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {tx.referenciaGateway ? (
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg w-fit border border-gray-100/50">
                                                <Search size={10} className="text-gray-400" />
                                                <span className="text-[10px] font-mono font-black text-gray-600 tracking-tight">
                                                    {tx.referenciaGateway.substring(0, 12)}...
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-gray-300 font-bold uppercase italic">— Interno</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className={cn(
                                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight",
                                            tx.isLiberado
                                                ? "bg-green-50 text-green-700 border border-green-100"
                                                : "bg-orange-50 text-orange-700 border border-orange-100"
                                        )}>
                                            {tx.isLiberado ? (
                                                <><Unlock size={10} /> Disponível</>
                                            ) : (
                                                <><Lock size={10} /> Pendente</>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <StatusBadge
                                            status={
                                                tx.status === 'CONCLUIDO' ? 'pago' :
                                                    tx.status === 'PENDENTE' ? 'pendente' :
                                                        tx.status === 'FALHA' ? 'atrasado' :
                                                            tx.status === 'CANCELADO' ? 'cancelado' :
                                                                tx.status.toLowerCase()
                                            }
                                            label={tx.status}
                                            className="scale-[0.85] origin-center"
                                        />
                                    </TableCell>
                                    <TableCell className="text-right px-8">
                                        <div className="flex flex-col items-end">
                                            <span className={cn(
                                                "text-lg font-black tracking-tighter",
                                                isIncome ? 'text-green-600' : 'text-gray-900'
                                            )}>
                                                {isIncome ? '+' : ''}{formatCurrency(valorNum)}
                                            </span>
                                            <ChevronRight size={14} className="text-gray-200 group-hover:text-primary transition-colors mt-0.5" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

