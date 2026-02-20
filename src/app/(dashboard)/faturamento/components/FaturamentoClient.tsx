"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { WithdrawalModal } from "./WithdrawalModal";
import { WalletTransactionTable } from "./WalletTransactionTable";
import { Wallet, ArrowUpRight, ArrowDownRight, Clock, AlertCircle } from "lucide-react";

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
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden relative">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-50 rounded-full opacity-50 pointer-events-none" />

                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                            <Wallet size={24} />
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            Disponível para saque
                        </span>
                    </div>

                    <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">Saldo Disponível</p>
                        <div className="text-4xl font-black text-gray-900 tracking-tight">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldoDisponivel)}
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={() => setIsWithdrawalModalOpen(true)}
                            disabled={!canWithdraw}
                            className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-sm
                                ${canWithdraw
                                    ? 'bg-primary text-white hover:bg-primary-hover shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                        >
                            Solicitar Saque PIX
                        </button>

                        {!hasPixKey && (
                            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                                <AlertCircle size={12} />
                                Configure a sua chave PIX nas Configurações para sacar.
                            </p>
                        )}
                        {hasPixKey && saldoDisponivel < 10 && (
                            <p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
                                <AlertCircle size={12} />
                                O valor mínimo para saque é R$ 10,00.
                            </p>
                        )}
                    </div>
                </div>

                {/* Saldo Pendente Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden relative">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-50 rounded-full opacity-50 pointer-events-none" />

                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-50 text-orange-500 rounded-xl">
                            <Clock size={24} />
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                            Em processamento
                        </span>
                    </div>

                    <div>
                        <p className="text-gray-500 text-sm font-medium mb-1">Saldo Pendente (14 dias)</p>
                        <div className="text-4xl font-black text-gray-900 tracking-tight">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldoPendente)}
                        </div>
                        <p className="text-sm text-gray-400 mt-2">
                            Pagamentos via Cartão de Crédito que estão dentro do prazo de clearing (liberação).
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Extrato Financeiro</h3>
                    <p className="text-sm text-gray-500">Histórico de todas as entradas, taxas e saídas da sua carteira.</p>
                </div>
                <div className="p-0">
                    <WalletTransactionTable transactions={initialData.transacoes || []} />
                </div>
            </div>

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
