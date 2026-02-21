"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { WithdrawalModal } from "./WithdrawalModal";
import { WalletTransactionTable } from "./WalletTransactionTable";
import { Wallet, ArrowUpRight, ArrowDownRight, Clock, AlertCircle } from "lucide-react";
import { SectionHeader } from "@/components/layout/SectionHeader";
import Link from "next/link";

export function FaturamentoClient({ initialData }: { initialData: any }) {
    const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);

    // Convert strings back to numbers if they are fetched as decimals from prisma
    const saldoDisponivel = Number(initialData.saldoDisponivel || 0);
    const saldoPendente = Number(initialData.saldoPendente || 0);

    const hasPixKey = !!initialData.chavePixSaque;
    const canWithdraw = saldoDisponivel >= 10 && hasPixKey;

    return (
        <PageContainer>
            <PageHeader
                title="Financeiro e Saques"
                description="Acompanhe seus recebimentos e solicite saques via PIX."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mt-6">
                {/* Saldo Disponível Card */}
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 overflow-hidden relative group hover:shadow-md transition-all duration-300">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-green-50 rounded-full opacity-50 pointer-events-none group-hover:scale-110 transition-transform duration-500" />

                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-green-50 text-green-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                            <Wallet size={24} />
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-100 text-green-700">
                            Disponível para saque
                        </span>
                    </div>

                    <div className="relative z-10">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Saldo Disponível</p>
                        <div className="text-5xl font-black text-gray-900 tracking-tighter">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldoDisponivel)}
                        </div>
                    </div>

                    <div className="mt-8 relative z-10">
                        <button
                            onClick={() => setIsWithdrawalModalOpen(true)}
                            disabled={!canWithdraw}
                            className={`w-full py-4 px-6 rounded-2xl font-black uppercase tracking-wider text-sm flex items-center justify-center gap-2 transition-all duration-300
                                ${canWithdraw
                                    ? 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 active:scale-[0.98]'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed grayscale'}`}
                        >
                            Solicitar Saque PIX
                        </button>

                        {!hasPixKey && (
                            <Link
                                href="/configuracoes?tab=conta"
                                className="text-[10px] text-red-500 mt-3 font-bold flex items-center gap-1.5 justify-center hover:underline group/pix"
                            >
                                <AlertCircle size={14} className="animate-pulse group-hover/pix:scale-110 transition-transform" />
                                Configure sua chave PIX nas Configurações
                            </Link>
                        )}
                        {hasPixKey && saldoDisponivel < 10 && (
                            <p className="text-[10px] text-orange-500 mt-3 font-bold flex items-center gap-1.5 justify-center">
                                <AlertCircle size={14} />
                                Valor mínimo para saque: R$ 10,00
                            </p>
                        )}
                    </div>
                </div>

                {/* Saldo Pendente Card */}
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 overflow-hidden relative group hover:shadow-md transition-all duration-300">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-orange-50 rounded-full opacity-50 pointer-events-none group-hover:scale-110 transition-transform duration-500" />

                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                            <Clock size={24} />
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-700">
                            Em processamento
                        </span>
                    </div>

                    <div className="relative z-10">
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Saldo Pendente (14 dias)</p>
                        <div className="text-5xl font-black text-gray-900 tracking-tighter">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldoPendente)}
                        </div>
                        <p className="text-xs text-gray-400 mt-4 font-medium leading-relaxed max-w-[240px]">
                            Pagamentos via Cartão de Crédito em prazo de liberação.
                        </p>
                    </div>
                </div>
            </div>

            <SectionHeader
                title="Extrato Financeiro"
                description="Histórico de todas as entradas, taxas e saídas da sua carteira."
                className="mt-8 mb-4"
            />

            <WalletTransactionTable transactions={initialData.transacoes || []} />

            <WithdrawalModal
                isOpen={isWithdrawalModalOpen}
                onClose={() => setIsWithdrawalModalOpen(false)}
                availableBalance={saldoDisponivel}
                pixKey={initialData.chavePixSaque}
                pixType={initialData.tipoChavePix}
            />
        </PageContainer>
    );
}
