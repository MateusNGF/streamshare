"use client";

import { useState } from "react";
import { DollarSign, CheckCircle, AlertCircle } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { KPIFinanceiroCard } from "@/components/dashboard/KPIFinanceiroCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { confirmarPagamento } from "@/actions/cobrancas";

interface CobrancasClientProps {
    kpis: {
        totalPendente: number;
        receitaConfirmada: number;
        emAtraso: number;
        totalCobrancas: number;
    };
    cobrancasIniciais: any[];
}

export function CobrancasClient({ kpis, cobrancasIniciais }: CobrancasClientProps) {
    const [cobrancas, setCobrancas] = useState(cobrancasIniciais);
    const [loading, setLoading] = useState(false);

    const handleConfirmarPagamento = async (id: number) => {
        if (!confirm("Confirmar pagamento desta cobrança?")) return;

        setLoading(true);
        try {
            await confirmarPagamento(id);
            // Refresh the page to update data
            window.location.reload();
        } catch (error) {
            alert("Erro ao confirmar pagamento");
            setLoading(false);
        }
    };

    return (
        <PageContainer>
            <PageHeader
                title="Cobranças"
                description="Gestão financeira de pagamentos"
            />

            {/* KPIs Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <KPIFinanceiroCard
                    titulo="Total a Receber"
                    valor={kpis.totalPendente}
                    icone={DollarSign}
                    cor="primary"
                />
                <KPIFinanceiroCard
                    titulo="Receita Confirmada"
                    valor={kpis.receitaConfirmada}
                    icone={CheckCircle}
                    cor="green"
                />
                <KPIFinanceiroCard
                    titulo="Em Atraso"
                    valor={kpis.emAtraso}
                    icone={AlertCircle}
                    cor="red"
                />
            </div>

            {/* Charges Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {cobrancas.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium mb-2">Nenhuma cobrança encontrada</p>
                        <p className="text-sm">
                            Crie assinaturas para participantes e as cobranças serão geradas automaticamente.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left p-4 text-sm font-medium text-gray-700">Participante</th>
                                    <th className="text-left p-4 text-sm font-medium text-gray-700">Streaming</th>
                                    <th className="text-left p-4 text-sm font-medium text-gray-700">Valor</th>
                                    <th className="text-left p-4 text-sm font-medium text-gray-700">Período</th>
                                    <th className="text-left p-4 text-sm font-medium text-gray-700">Vencimento</th>
                                    <th className="text-left p-4 text-sm font-medium text-gray-700">Status</th>
                                    <th className="text-left p-4 text-sm font-medium text-gray-700">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cobrancas.map((cobranca: any) => (
                                    <tr key={cobranca.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900">
                                                {cobranca.assinatura.participante.nome}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {cobranca.assinatura.participante.whatsappNumero}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: cobranca.assinatura.streaming.catalogo.corPrimaria }}
                                                />
                                                <span className="text-sm text-gray-700">
                                                    {cobranca.assinatura.streaming.catalogo.nome}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-bold text-gray-900">
                                                {new Intl.NumberFormat('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL'
                                                }).format(Number(cobranca.valor))}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-gray-600">
                                                {new Date(cobranca.periodoInicio).toLocaleDateString('pt-BR', {
                                                    day: '2-digit',
                                                    month: 'short'
                                                })} - {new Date(cobranca.periodoFim).toLocaleDateString('pt-BR', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-gray-900">
                                                {new Date(cobranca.periodoFim).toLocaleDateString('pt-BR')}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <StatusBadge status={cobranca.status} />
                                        </td>
                                        <td className="p-4">
                                            {cobranca.status === "pendente" && (
                                                <button
                                                    onClick={() => handleConfirmarPagamento(cobranca.id)}
                                                    disabled={loading}
                                                    className="text-primary hover:underline font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Confirmar Pagamento
                                                </button>
                                            )}
                                            {cobranca.status === "pago" && cobranca.dataPagamento && (
                                                <div className="text-xs text-gray-500">
                                                    Pago em {new Date(cobranca.dataPagamento).toLocaleDateString('pt-BR')}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </PageContainer>
    );
}
