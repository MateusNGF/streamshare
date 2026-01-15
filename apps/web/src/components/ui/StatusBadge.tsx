import { StatusCobranca } from "@streamshare/database";

interface StatusBadgeProps {
    status: StatusCobranca;
}

const statusConfig: Record<StatusCobranca, { color: string; label: string }> = {
    pendente: { color: "bg-amber-100 text-amber-700 border-amber-200", label: "Pendente" },
    pago: { color: "bg-green-100 text-green-700 border-green-200", label: "Pago" },
    atrasado: { color: "bg-red-100 text-red-700 border-red-200", label: "Atrasado" },
    cancelado: { color: "bg-gray-100 text-gray-700 border-gray-200", label: "Cancelado" }
};

export function StatusBadge({ status }: StatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
            {config.label}
        </span>
    );
}
