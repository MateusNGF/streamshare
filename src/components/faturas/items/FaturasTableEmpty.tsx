"use client";

import { CheckCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export function FaturasTableEmpty() {
    return (
        <div className="py-8">
            <EmptyState
                icon={CheckCircle}
                title="Tudo em dia! 🎉"
                description="Suas assinaturas estão garantidas. Nenhuma fatura pendente ou atrasada."
                className="bg-green-50/20 border-green-100"
            />
        </div>
    );
}
