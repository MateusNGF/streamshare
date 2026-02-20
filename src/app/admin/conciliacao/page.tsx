import { Metadata } from "next";
import { getConciliacaoFinanceira } from "@/actions/admin/saques";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Scale, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
    title: "Conciliação Bancária - Admin Cripta",
};

export default async function ConciliacaoPage() {
    const response = await getConciliacaoFinanceira();

    if (!response.success || !response.data) {
        return (
            <PageContainer>
                <PageHeader title="Conciliação Financeira" description="Acompanhe o saldo total alocado no sistema." />
                <div className="mt-8 p-6 bg-red-50 text-red-600 rounded-xl flex items-center gap-3">
                    <AlertCircle size={24} />
                    <p>{response.error || "Erro ao carregar conciliação."}</p>
                </div>
            </PageContainer>
        );
    }

    const { totalDisponivel, totalPendente } = response.data;
    const totalGeral = totalDisponivel + totalPendente;

    return (
        <PageContainer>
            <PageHeader
                title="Conciliação Financeira"
                description="Resumo de todos os fundos mantidos nas carteiras virtuais (Ledger interno)."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-green-50 rounded-bl-full pointer-events-none opacity-50" />
                    <p className="text-gray-500 font-medium mb-1">Total Disponível para Saque</p>
                    <p className="text-3xl font-bold text-gray-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalDisponivel)}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Soma do saldoDisponivel de todas as Wallets.</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-orange-50 rounded-bl-full pointer-events-none opacity-50" />
                    <p className="text-gray-500 font-medium mb-1">Total Pendente (Clearing)</p>
                    <p className="text-3xl font-bold text-gray-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPendente)}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Soma do saldoPendente de todas as Wallets (Catões).</p>
                </div>

                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-primary/10 rounded-bl-full pointer-events-none" />
                    <div className="flex items-center gap-2 mb-1">
                        <Scale className="text-primary" size={18} />
                        <p className="text-primary flex-1 font-medium">Exigência Bancária no Mercado Pago</p>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalGeral)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        O saldo da sua conta real no MercadoPago DEVE ser maior ou igual a este valor.
                    </p>
                </div>
            </div>
        </PageContainer>
    );
}
