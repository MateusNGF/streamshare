import { cn } from "@/lib/utils";

const statusStyles: Record<string, { color: string; label: string }> = {
    // Green / Success
    pago: { color: "bg-green-100 text-green-700 border-green-200", label: "Pago" },
    ativa: { color: "bg-green-100 text-green-700 border-green-200", label: "Ativa" },
    ativo: { color: "bg-green-100 text-green-700 border-green-200", label: "Ativo" },

    // Amber / Warning / Pending
    pendente: { color: "bg-amber-100 text-amber-700 border-amber-200", label: "Pendente" },
    aguardando: { color: "bg-amber-100 text-amber-700 border-amber-200", label: "Aguardando" },

    // Red / Error / Overdue
    atrasado: { color: "bg-red-100 text-red-700 border-red-200", label: "Atrasado" },
    suspensa: { color: "bg-red-100 text-red-700 border-red-200", label: "Suspensa" },
    past_due: { color: "bg-red-100 text-red-700 border-red-200", label: "Em Atraso" },
    unpaid: { color: "bg-red-100 text-red-700 border-red-200", label: "Não Pago" },
    inativo: { color: "bg-red-100 text-red-700 border-red-200", label: "Inativo" },
    bloqueado: { color: "bg-red-100 text-red-700 border-red-200", label: "Bloqueado" },

    // Gray / Neutral
    cancelado: { color: "bg-gray-100 text-gray-700 border-gray-200", label: "Cancelado" },
    cancelada: { color: "bg-gray-100 text-gray-700 border-gray-200", label: "Cancelada" },
    excluido: { color: "bg-gray-200 text-gray-800 border-gray-300", label: "Excluído" },

    // Purple / Scheduled
    cancelamento_agendado: { color: "bg-purple-100 text-purple-700 border-purple-200", label: "Cancelamento Agendado" },
};

interface StatusBadgeProps {
    status: string;
    label?: string;
    className?: string;
    dataCancelamento?: Date | string | null;
    deletedAt?: Date | string | null;
}

export function StatusBadge({ status, label, className, dataCancelamento, deletedAt }: StatusBadgeProps) {
    let normalizedStatus = status.toLowerCase();

    // Override status if soft deleted
    if (deletedAt) {
        normalizedStatus = 'excluido';
    }
    // Override status if active but has cancellation date
    else if (normalizedStatus === 'ativa' && dataCancelamento) {
        normalizedStatus = 'cancelamento_agendado';
    }

    const config = statusStyles[normalizedStatus] || {
        color: "bg-gray-100 text-gray-700 border-gray-200",
        label: label || status
    };

    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all duration-300 animate-in fade-in zoom-in-95",
                config.color,
                className
            )}
        >
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-60" />
            {label || config.label}
        </span>
    );
}
