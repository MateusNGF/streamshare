"use client";

import { DollarSign, CheckCircle, AlertCircle, FileStack, ChevronRight } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { GenericFilter } from "@/components/ui/GenericFilter";
import { KPIFinanceiroCard } from "@/components/dashboard/KPIFinanceiroCard";
import { KPIGrid, KPIGridItem } from "@/components/dashboard/KPIGrid";
import { useCobrancasActions } from "@/hooks/useCobrancasActions";
import { CobrancasTable } from "@/components/cobrancas/CobrancasTable";
import { CobrancaCard } from "@/components/cobrancas/CobrancaCard";
import { CobrancasModals } from "@/components/cobrancas/CobrancasModals";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ViewModeToggle, ViewMode } from "@/components/ui/ViewModeToggle";
import { FeatureGuards } from "@/lib/feature-guards";
import { PlanoConta } from "@prisma/client";
import { UpgradeBanner } from "@/components/ui/UpgradeBanner";
import { UpgradeFeatureOverlay } from "@/components/ui/UpgradeFeatureOverlay";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionError } from "@/hooks/useActionError";
import { useEffect, useState } from "react";

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
    const [viewMode, setViewMode] = useState<ViewMode>("table");
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
        handleViewQrCode,
        qrModalOpen, setQrModalOpen,
        setSelectedCobrancaId
    } = useCobrancasActions(cobrancasIniciais);

    const whatsappCheck = FeatureGuards.isFeatureEnabled(plano, "whatsapp_integration");
    const automaticBillingCheck = FeatureGuards.isFeatureEnabled(plano, "automatic_billing");

    const pendingApprovalsCount = cobrancasIniciais.filter(c => c.status === 'aguardando_aprovacao').length;

    return (
        <PageContainer>
            <PageHeader
                title="Cobranças"
                description="Controle de pagamentos e envios de cobrança."
            />

            {pendingApprovalsCount > 0 && (
                <div
                    className="mb-6 bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-center justify-between shadow-sm cursor-pointer hover:bg-blue-100 transition-colors animate-in fade-in slide-in-from-top-4"
                    onClick={() => {
                        setStatusFilter("aguardando_aprovacao");
                        setTimeout(() => window.scrollTo({ top: 400, behavior: 'smooth' }), 100);
                    }}
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                            <FileStack size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-blue-900 text-lg">Faturas a Aguardar Validação ({pendingApprovalsCount})</h4>
                            <p className="text-sm text-blue-700">Participantes enviaram comprovantes que precisam da sua aprovação.</p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-1 text-sm font-bold text-blue-700 bg-white px-4 py-2 rounded-lg border border-blue-100 shadow-sm">
                        Ver Faturas
                        <ChevronRight size={16} />
                    </div>
                </div>
            )}

            <KPIGrid cols={3} >
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
                                { label: "Aguardando", value: "aguardando_aprovacao" },
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

            <div className="space-y-4 relative mt-2">
                <SectionHeader
                    title="Listagem de Cobranças"
                    className="mb-0"
                    rightElement={
                        <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
                    }
                />

                {!whatsappCheck.enabled && (
                    <UpgradeBanner
                        title="Automatize suas cobranças via WhatsApp"
                        description="No plano Business, o sistema envia cobranças automaticamente para você."
                        className="mb-4"
                    />
                )}

                {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredCobrancas.map((cobranca) => (
                            <CobrancaCard
                                key={cobranca.id}
                                cobranca={cobranca}
                                isOverdue={cobranca.status === 'atrasado'}
                                formatDate={(date) => new Date(date).toLocaleDateString()}
                                formatPeriod={(start, end) => ""}
                                onViewDetails={() => {
                                    setSelectedCobrancaId(cobranca.id);
                                    setDetailsModalOpen(true);
                                }}
                                onConfirmPayment={() => handleConfirmarPagamento(cobranca.id)}
                                onSendWhatsApp={() => handleEnviarWhatsApp(cobranca.id)}
                                onCancel={() => handleCancelarCobranca(cobranca.id)}
                                onViewQrCode={() => handleViewQrCode(cobranca.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <CobrancasTable
                        cobrancas={filteredCobrancas}
                        onViewDetails={(id) => {
                            setSelectedCobrancaId(id);
                            setDetailsModalOpen(true);
                        }}
                        onConfirmPayment={handleConfirmarPagamento}
                        onSendWhatsApp={handleEnviarWhatsApp}
                        onCancelPayment={handleCancelarCobranca}
                        searchTerm={searchTerm}
                        statusFilter={statusFilter}
                        onViewQrCode={handleViewQrCode}
                    />
                )}
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
                qrModalOpen={qrModalOpen}
                onCloseQrModal={() => setQrModalOpen(false)}
            />
        </PageContainer>
    );
}
