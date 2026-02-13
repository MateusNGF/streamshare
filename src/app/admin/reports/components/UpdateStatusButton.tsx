"use client";

import { updateReportStatus } from "@/actions/suporte";
import { AlertCircle, Check, Loader2, RefreshCw, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useToast } from "@/contexts/ToastContext";
import { Dropdown } from "@/components/ui/Dropdown";

interface UpdateStatusButtonProps {
    id: number;
    currentStatus: string;
}

export function UpdateStatusButton({ id, currentStatus }: UpdateStatusButtonProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const { showToast } = useToast();

    const statuses = [
        { value: "pendente", label: "Pendente", icon: <AlertCircle size={16} />, variant: "default" as const },
        { value: "em_analise", label: "Em Análise", icon: <RefreshCw size={16} />, variant: "default" as const },
        { value: "resolvido", label: "Resolvido", icon: <Check size={16} />, variant: "success" as const },
        { value: "finalizado", label: "Finalizado", icon: <XCircle size={16} />, variant: "default" as const },
    ];

    const currentStatusOption = statuses.find(s => s.value === currentStatus);

    const handleUpdate = (status: string) => {
        startTransition(async () => {
            const result = await updateReportStatus(id, status as any);
            if (result.success) {
                showToast(
                    "success",
                    `Report #${id} atualizado para ${status}.`
                );
                router.refresh();
            } else {
                showToast(
                    "error",
                    "Erro ao atualizar status."
                );
            }
        });
    };

    const dropdownOptions = statuses.map((status) => ({
        label: status.label,
        icon: status.icon,
        variant: status.variant,
        onClick: () => handleUpdate(status.value),
    }));

    return (
        <div className="flex justify-end">
            <Dropdown
                align="right"
                trigger={
                    <div className={`p-2 rounded-full transition-colors ${isPending ? "text-gray-300" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        }`}>
                        {isPending ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <RefreshCw size={18} />
                        )}
                    </div>
                }
                options={dropdownOptions}
            />
        </div>
    );
}
