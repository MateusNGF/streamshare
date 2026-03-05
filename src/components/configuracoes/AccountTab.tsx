"use client";

import { Building2, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { SUPPORTED_CURRENCIES, CurrencyCode } from "@/types/currency.types";
import { PlanCardSettings } from "./PlanCardSettings";
import { ToastVariant } from "@/components/ui/Toast";

interface AccountTabProps {
    accountData: {
        nome: string;
        email: string;
        chavePix: string;
    };
    setAccountData: (data: any) => void;
    onUpdateAccount: (e: React.FormEvent) => void;
    loadingAccount: boolean;
    hasAccountChanges: boolean;
    currency: CurrencyCode;
    onUpdateCurrency: (newCurrency: CurrencyCode) => void;
    loadingCurrency: boolean;
    conta: any;
    showToast: (message: string, variant?: ToastVariant) => void;
    diasVencimento: number[];
    setDiasVencimento: (dias: number[]) => void;
    onUpdateDiasVencimento: () => void;
    loadingDias: boolean;
}

export function AccountTab({
    accountData,
    setAccountData,
    onUpdateAccount,
    loadingAccount,
    hasAccountChanges,
    currency,
    onUpdateCurrency,
    loadingCurrency,
    conta,
    showToast,
    diasVencimento,
    setDiasVencimento,
    onUpdateDiasVencimento,
    loadingDias
}: AccountTabProps) {
    const DIAS_OPCOES = [1, 5, 10, 15, 20, 25];

    const toggleDia = (dia: number) => {
        setDiasVencimento(
            diasVencimento.includes(dia)
                ? diasVencimento.filter(d => d !== dia)
                : [...diasVencimento, dia]
        );
    };
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Coluna Principal */}
            <div className="lg:col-span-2 space-y-16">
                {/* Informações da Conta */}
                <section>
                    <SectionHeader
                        title="Informações da Conta"
                        description="Configure os detalhes da sua unidade organizacional"
                    />
                    <form onSubmit={onUpdateAccount} className="space-y-6 mt-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Nome da Conta"
                                type="text"
                                value={accountData.nome}
                                onChange={(e) => setAccountData({ ...accountData, nome: e.target.value })}
                                placeholder="Ex: Minha Família"
                                required
                                minLength={3}
                                disabled={loadingAccount}
                            />
                            <Input
                                label="Email de Contato"
                                type="email"
                                value={accountData.email}
                                onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                                placeholder="Ex: financeiro@email.com"
                                disabled={loadingAccount}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Chave PIX para Recebimento"
                                type="text"
                                value={accountData.chavePix}
                                onChange={(e) => setAccountData({ ...accountData, chavePix: e.target.value })}
                                placeholder="CPF, Email, Telefone ou Aleatória"
                                disabled={loadingAccount}
                            />
                            <div className="flex items-end pb-1">
                                <p className="text-xs text-gray-400 italic font-medium">
                                    * Esta chave será exibida para os participantes nos lembretes de pagamento.
                                </p>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-start">
                            <button
                                type="submit"
                                disabled={loadingAccount || !hasAccountChanges}
                                className={`
                                    min-w-[200px] h-14 rounded-2xl font-bold transition-all
                                    shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20
                                    ${hasAccountChanges
                                        ? "bg-primary text-white hover:scale-[1.02] active:scale-95"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"}
                                `}
                            >
                                {loadingAccount
                                    ? "Salvando..."
                                    : hasAccountChanges
                                        ? "Salvar Alterações ✓"
                                        : "Conta Atualizada"}
                            </button>
                        </div>
                    </form>
                </section>

                {/* Preferências de Moeda */}
                <section>
                    <SectionHeader
                        title="Preferências Regionais"
                        description="Escolha como deseja visualizar os valores na plataforma"
                    />
                    <div className="space-y-6 mt-8">
                        <div className="max-w-md">
                            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                                Moeda Padrão do Sistema
                            </label>
                            <Select value={currency} onValueChange={(value) => onUpdateCurrency(value as CurrencyCode)} disabled={loadingCurrency}>
                                <SelectTrigger className="w-full h-16 rounded-2xl border-gray-100 bg-white hover:border-primary transition-all shadow-sm px-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl">
                                            {SUPPORTED_CURRENCIES[currency].symbol}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-gray-900">{SUPPORTED_CURRENCIES[currency].name}</p>
                                            <p className="text-xs text-gray-400 font-medium">{SUPPORTED_CURRENCIES[currency].code}</p>
                                        </div>
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-gray-100 shadow-2xl p-2">
                                    {Object.entries(SUPPORTED_CURRENCIES).map(([code, info]) => (
                                        <SelectItem key={code} value={code} className="rounded-xl py-3 focus:bg-primary/5">
                                            <div className="flex items-center gap-4">
                                                <span className="text-xl w-8 text-center">{info.symbol}</span>
                                                <div className="text-left">
                                                    <span className="block text-sm font-bold text-gray-900">
                                                        {info.name}
                                                    </span>
                                                    <span className="text-xs text-gray-500 font-medium">{info.code}</span>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10 max-w-2xl">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <DollarSign size={16} className="text-primary" />
                            </div>
                            <p className="text-xs text-primary/80 font-medium leading-relaxed">
                                Esta moeda será aplicada como base para todos os cálculos financeiros, conversões e exibições em tempo real no seu dashboard.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Vencimento de Cobranças */}
                <section>
                    <SectionHeader
                        title="Vencimento de Cobranças"
                        description="Configure os dias padrão para o vencimento de novas assinaturas"
                    />
                    <div className="space-y-6 mt-8">
                        <div className="max-w-2xl">
                            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                                Dias Disponíveis
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {DIAS_OPCOES.map((dia) => (
                                    <button
                                        key={dia}
                                        type="button"
                                        onClick={() => toggleDia(dia)}
                                        disabled={loadingDias}
                                        className={`w-14 h-14 rounded-2xl font-bold transition-all shadow-sm
                                            ${diasVencimento.includes(dia)
                                                ? "bg-primary text-white scale-[1.02] shadow-primary/20"
                                                : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900 border border-gray-100"
                                            }
                                        `}
                                    >
                                        {dia}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10 max-w-2xl">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <DollarSign size={16} className="text-primary" />
                            </div>
                            <p className="text-xs text-primary/80 font-medium leading-relaxed">
                                As cobranças geradas seguirão o dia configurado mais próximo. A primeira cobrança será proporcional (pro-rata) até atingir o próximo vencimento.
                            </p>
                        </div>

                        <div className="pt-2 flex justify-start">
                            <button
                                type="button"
                                onClick={onUpdateDiasVencimento}
                                disabled={loadingDias}
                                className={`
                                    min-w-[200px] h-14 rounded-2xl font-bold transition-all
                                    shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20
                                    ${true // Always allow save if there are changes or we can just always allow
                                        ? "bg-primary text-white hover:scale-[1.02] active:scale-95"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"}
                                `}
                            >
                                {loadingDias ? "Salvando..." : "Salvar Alterações ✓"}
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                <PlanCardSettings
                    conta={conta}
                    showToast={showToast}
                />
            </div>
        </div>
    );
}
