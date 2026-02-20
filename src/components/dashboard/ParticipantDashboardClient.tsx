"use client";

import { ParticipantStats, ParticipantSubscription } from "@/types/dashboard.types";
import { PersonalFinancialSummary } from "./sections/PersonalFinancialSummary";
import { MySubscriptionsSection } from "./sections/MySubscriptionsSection";
import { ParticipantQuickActions } from "./sections/ParticipantQuickActions";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useActionError } from "@/hooks/useActionError";

const StreamingModal = dynamic(() => import("@/components/modals/StreamingModal").then(mod => mod.StreamingModal));
const AddMemberModal = dynamic(() => import("@/components/modals/AddMemberModal").then(mod => mod.AddMemberModal));
const SupportModal = dynamic(() => import("@/components/support/SupportModal").then(mod => mod.SupportModal));

interface ParticipantDashboardClientProps {
    stats: ParticipantStats | null;
    subscriptions: ParticipantSubscription[];
    error?: string;
}

export function ParticipantDashboardClient({ stats, subscriptions, error }: ParticipantDashboardClientProps) {
    const [isStreamingModalOpen, setIsStreamingModalOpen] = useState(false);
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

    useActionError(error);

    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <p className="text-gray-500 mb-4">Não foi possível carregar as estatísticas do dashboard.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="text-primary font-bold hover:underline"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-slide-in-from-bottom">
            {/* Targeted actions for participants */}
            <ParticipantQuickActions
                onOpenSupport={() => setIsSupportModalOpen(true)}
            />

            {/* Personalized Analytics */}
            <PersonalFinancialSummary stats={stats} />

            {/* Specific Participant Data */}
            <MySubscriptionsSection
                subscriptions={subscriptions}
                currencyCode={stats.currencyCode}
            />

            {/* Modals are still available if they want to start providing */}
            <StreamingModal
                isOpen={isStreamingModalOpen}
                onClose={() => setIsStreamingModalOpen(false)}
                onSave={async () => { }} // Placeholder as participant might not create immediately
                loading={false}
            />

            <AddMemberModal
                isOpen={isAddMemberModalOpen}
                onClose={() => setIsAddMemberModalOpen(false)}
                streamings={[]} // Participant might not have streamings to add members to
            />

            <SupportModal
                isOpen={isSupportModalOpen}
                onClose={() => setIsSupportModalOpen(false)}
            />
        </div>
    );
}
