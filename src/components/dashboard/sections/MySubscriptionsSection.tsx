"use client";

import { ParticipantSubscription } from "@/types/dashboard.types";
import { Button } from "@/components/ui/Button";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { DetalhesAssinaturaModal } from "@/components/modals/DetalhesAssinaturaModal";
import { getParticipantSubscriptionDetail } from "@/actions/dashboard";
import { useToast } from "@/hooks/useToast";
import { ViewModeToggle, ViewMode } from "@/components/ui/ViewModeToggle";
import { MySubscriptionsTable } from "./MySubscriptionsTable";
import { MySubscriptionsGrid } from "./MySubscriptionsGrid";
import { SectionHeader } from "@/components/layout/SectionHeader";

interface MySubscriptionsSectionProps {
    subscriptions: ParticipantSubscription[];
    currencyCode: string;
}

export function MySubscriptionsSection({ subscriptions, currencyCode }: MySubscriptionsSectionProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("table");
    const [selectedAssinatura, setSelectedAssinatura] = useState<any>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const toast = useToast();

    const handleViewDetails = async (subId: number) => {
        setLoadingDetails(true);
        try {
            const response = await getParticipantSubscriptionDetail(subId);
            if (response.success) {
                setSelectedAssinatura(response.data);
                setIsDetailsModalOpen(true);
            } else {
                toast.error(response.error || "Erro ao carregar detalhes");
            }
        } catch (error: any) {
            toast.error(error.message || "Erro ao carregar detalhes");
        } finally {
            setLoadingDetails(false);
        }
    };

    return (
        <section className="space-y-6">
            <SectionHeader
                title="Minhas Assinaturas"
                className="mb-0"
                rightElement={
                    subscriptions.length > 0 && (
                        <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
                    )
                }
            />

            {subscriptions.length === 0 ? (
                <div className="p-12 text-center border-dashed border-2 bg-gray-50/50 rounded-[32px] border-gray-200">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                            <ShieldCheck className="w-8 h-8 text-gray-300" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Nenhuma assinatura</h3>
                            <p className="text-gray-500 max-w-xs mx-auto">Você ainda não possui assinaturas ativas ou pendentes.</p>
                        </div>
                        <Link href="/explore">
                            <Button variant="outline" className="rounded-full px-8">
                                Explorar Vagas
                            </Button>
                        </Link>
                    </div>
                </div>
            ) : (
                viewMode === "table" ? (
                    <MySubscriptionsTable
                        subscriptions={subscriptions}
                        currencyCode={currencyCode}
                        onViewDetails={handleViewDetails}
                    />
                ) : (
                    <MySubscriptionsGrid
                        subscriptions={subscriptions}
                        currencyCode={currencyCode}
                        onViewDetails={handleViewDetails}
                    />
                )
            )}

            <DetalhesAssinaturaModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                assinatura={selectedAssinatura}
                isAdmin={false}
            />
        </section>
    );
}
