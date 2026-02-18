"use client";

import { DollarSign, CheckCircle, AlertCircle } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { GenericFilter } from "@/components/ui/GenericFilter";
import { KPIFinanceiroCard } from "@/components/dashboard/KPIFinanceiroCard";
import { KPIGrid, KPIGridItem } from "@/components/dashboard/KPIGrid";
import { useCobrancasActions } from "@/hooks/useCobrancasActions";
import { CobrancasTable } from "@/components/cobrancas/CobrancasTable";
import { CobrancasModals } from "@/components/cobrancas/CobrancasModals";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { FeatureGuards } from "@/lib/feature-guards";
import { PlanoConta } from "@prisma/client";
import { UpgradeBanner } from "@/components/ui/UpgradeBanner";
import { UpgradeFeatureOverlay } from "@/components/ui/UpgradeFeatureOverlay";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionError } from "@/hooks/useActionError";
import { useEffect } from "react";

interface CobrancasClientProps {
    kpis: {
        totalPendente: number;
        receitaConfirmada: number;
        emAtraso: number;
        totalCobrancas: number;
    };
    cobrancasIniciais: any[];
    whatsappConfigurado: boolean;
    streamings: any[];
    plano: PlanoConta;
    error?: string;
}

export function CobrancasClient({ kpis, cobrancasIniciais, whatsappConfigurado, streamings, plano, error }: CobrancasClientProps) {
    const router = useRouter();
    useActionError(error);
    const {
        searchTerm, setSearchTerm,
        statusFilter, setStatusFilter,
        loading,
        cancelModalOpen, setCancelModalOpen,
        confirmPaymentModalOpen, setConfirmPaymentModalOpen,
        detailsModalOpen, setDetailsModalOpen,
        selectedCobranca,
        vencimentoRange, setVencimentoRange,
        pagamentoRange, setPagamentoRange,
        valorRange, setValorRange,
        hasWhatsappFilter, setHasWhatsappFilter,
        filteredCobrancas,
        handleConfirmarPagamento,
        executePaymentConfirmation,
        handleCancelarCobranca,
        confirmCancellation,
        handleEnviarWhatsApp,
        handleClearFilters,
        setSelectedCobrancaId // Added this just in case, though handled by actions
    } = useCobrancasActions(cobrancasIniciais);

    const whatsappCheck = FeatureGuards.isFeatureEnabled(plano, "whatsapp_integration");
    const automaticBillingCheck = FeatureGuards.isFeatureEnabled(plano, "automatic_billing");

    return (
        <PageContainer>
            <PageHeader
                title="Cobranças"
                description="Controle de pagamentos e envios de cobrança."
            />

            <KPIGrid cols={3} className="mb-10">
                <KPIGridItem>
                    <KPIFinanceiroCard
                        titulo="Total a Receber"
                        valor={kpis.totalPendente}
                        icone={DollarSign}
                        cor="primary"
                        index={0}
                    />
                </KPIGridItem>
                <KPIGridItem>
                    <KPIFinanceiroCard
                        titulo="Receita Confirmada"
                        valor={kpis.receitaConfirmada}
                        icone={CheckCircle}
                        cor="green"
                        index={1}
                    />
                </KPIGridItem>
                <KPIGridItem>
                    <KPIFinanceiroCard
                        titulo="Em Atraso"
                        valor={kpis.emAtraso}
                        icone={AlertCircle}
                        cor="red"
                        index={2}
                    />
                </KPIGridItem>
            </KPIGrid>

            <div className="py-6">
                <GenericFilter
                    filters={[
                        {
                            key: "search",
                            type: "text",
                            placeholder: "Buscar participante...",
                            className: "flex-1 min-w-[200px]"
                        },
                        {
                            key: "status",
                            type: "select",
                            label: "Status",
                            className: "w-full md:w-[150px]",
                            options: [
                                { label: "Pendente", value: "pendente" },
                                { label: "Pago", value: "pago" },
                                { label: "Atrasado", value: "atrasado" },
                                { label: "Cancelado", value: "cancelado" }
                            ]
                        },
                        {
                            key: "streaming",
                            type: "select",
                            label: "Streaming",
                            className: "w-full md:w-[200px]",
                            options: streamings.map(s => ({
                                label: s.apelido || s.catalogo.nome,
                                value: s.id.toString(),
                                icon: s.catalogo.iconeUrl,
                                color: s.catalogo.corPrimaria
                            }))
                        },
                        {
                            key: "vencimento",
                            type: "dateRange",
                            label: "Data de Vencimento",
                            placeholder: "Filtrar vencimento"
                        },
                        {
                            key: "pagamento",
                            type: "dateRange",
                            label: "Data de Pagamento",
                            placeholder: "Filtrar pagamento"
                        },
                        {
                            key: "valor",
                            type: "numberRange",
                            label: "Intervalo de Valor",
                            placeholder: "Valor entre..."
                        },
                        {
                            key: "hasWhatsapp",
                            type: "switch",
                            label: "Apenas com WhatsApp",
                            className: "md:w-auto"
                        }
                    ]}
                    values={{
                        search: searchTerm,
                        status: statusFilter,
                        vencimento: vencimentoRange,
                        pagamento: pagamentoRange,
                        valor: valorRange,
                        hasWhatsapp: hasWhatsappFilter
                    }}
                    onChange={(key: string, value: string) => {
                        if (key === "search") setSearchTerm(value);
                        if (key === "status") setStatusFilter(value);
                        if (key === "vencimento") setVencimentoRange(value);
                        if (key === "pagamento") setPagamentoRange(value);
                        if (key === "valor") setValorRange(value);
                        if (key === "hasWhatsapp") setHasWhatsappFilter(value);
                    }}
                    onClear={handleClearFilters}
                />
            </div>

            <div className="space-y-6 relative">
                <SectionHeader title="Listagem de Cobranças" className="mb-0" />

                {!whatsappCheck.enabled && (
                    <UpgradeBanner
                        title="Automatize suas cobranças via WhatsApp"
                        description="No plano Business, o sistema envia cobranças automaticamente para você."
                        className="mb-4"
                    />
                )}

                <CobrancasTable
                    cobrancas={filteredCobrancas}
                    onViewDetails={(id) => {
                        setSelectedCobrancaId(id);
                        setDetailsModalOpen(true);
                    }}
                    onConfirmPayment={handleConfirmarPagamento}
                    onSendWhatsApp={handleEnviarWhatsApp}
                    onCancel={handleCancelarCobranca}
                    searchTerm={searchTerm}
                    statusFilter={statusFilter}
                />
            </div>

            <CobrancasModals
                cancelModalOpen={cancelModalOpen}
                onCloseCancel={() => setCancelModalOpen(false)}
                onConfirmCancel={confirmCancellation}
                confirmPaymentModalOpen={confirmPaymentModalOpen}
                onCloseConfirmPayment={() => setConfirmPaymentModalOpen(false)}
                onConfirmPayment={executePaymentConfirmation}
                detailsModalOpen={detailsModalOpen}
                onCloseDetails={() => {
                    setDetailsModalOpen(false);
                    setSelectedCobrancaId(null);
                }}
                selectedCobranca={selectedCobranca}
                loading={loading}
            />
        </PageContainer>
    );
}
