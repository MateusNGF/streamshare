import { Phone, Mail, CreditCard, Edit, Trash2, Eye, User, MoreHorizontal, Copy } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import { Dropdown } from "@/components/ui/Dropdown";
import { useToast } from "@/hooks/useToast";

interface ParticipantCardProps {
    id: number;
    name: string;
    whatsapp?: string;
    email?: string;
    cpf?: string | null;
    subscriptionsCount: number;
    status: "ativa" | "suspensa" | "inativo";
    userId?: number | null;
    onEdit: () => void;
    onDelete: () => void;
    onView: () => void;
}

export function ParticipantCard({
    name,
    whatsapp,
    email,
    subscriptionsCount,
    status,
    userId,
    onEdit,
    onDelete,
    onView,
}: ParticipantCardProps) {
    const toast = useToast();
    const initial = name.charAt(0).toUpperCase();
    const isLinked = !!userId;

    const handleCopy = (e: React.MouseEvent, text: string, label: string) => {
        e.stopPropagation();
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.info(`${label} copiado!`);
    };

    const options = [
        { label: "Ver Detalhes", icon: <Eye size={16} />, onClick: onView },
        { label: "Editar", icon: <Edit size={16} />, onClick: onEdit },
        { label: "Excluir", icon: <Trash2 size={16} />, onClick: onDelete, variant: "danger" as const },
    ];

    return (
        <div
            className={cn(
                "group relative bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom",
                "hover:shadow-[0_20px_50px_rgba(109,40,217,0.1)] hover:-translate-y-1 hover:border-primary/20 cursor-pointer"
            )}
            onClick={onView}
        >
            <div className="flex items-center gap-4">
                {/* Avatar Section */}
                <div className="relative shrink-0">
                    <div className={cn(
                        "w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center font-black text-xl md:text-2xl transition-all duration-500 shadow-sm border border-white/50 group-hover:rotate-3 group-hover:scale-105",
                        isLinked
                            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                            : "bg-gradient-to-br from-violet-100 to-violet-200 text-primary group-hover:from-primary group-hover:to-accent group-hover:text-white"
                    )}>
                        {initial}
                    </div>
                    {isLinked && (
                        <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-lg shadow-md border border-gray-50 text-blue-500 animate-in zoom-in duration-500">
                            <User size={12} fill="currentColor" />
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                            <h3 className="text-base font-bold text-gray-900 truncate leading-tight group-hover:text-primary transition-colors">
                                {name}
                            </h3>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <StatusBadge status={status} className="scale-[0.7] origin-left" />
                                {isLinked && (
                                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                        Vinculado
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                            <Dropdown
                                options={options}
                                trigger={
                                    <div className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600">
                                        <MoreHorizontal size={18} />
                                    </div>
                                }
                            />
                        </div>
                    </div>

                    {/* Metrics Row - Highly compact and horizontal */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        <div className="flex items-center gap-2 group/metric">
                            <CreditCard size={14} className="text-gray-400 group-hover/metric:text-primary transition-colors" />
                            <span className="text-xs font-bold text-gray-600">
                                {subscriptionsCount} <span className="text-[9px] text-gray-400 font-medium uppercase tracking-tighter">Assinaturas</span>
                            </span>
                        </div>

                        {whatsapp && (
                            <div
                                className="flex items-center gap-2 group/value cursor-pointer"
                                onClick={(e) => handleCopy(e, whatsapp, "WhatsApp")}
                            >
                                <Phone size={14} className="text-gray-400 group-hover/value:text-primary transition-colors" />
                                <div className="flex items-center gap-1 min-w-0">
                                    <span className="text-xs font-bold text-gray-600 truncate max-w-[120px]">
                                        {whatsapp}
                                    </span>
                                    <Copy size={10} className="text-gray-300 opacity-0 group-hover/value:opacity-100 transition-all" />
                                </div>
                            </div>
                        )}

                        {email && (
                            <div
                                className="flex items-center gap-2 group/value cursor-pointer hidden sm:flex"
                                onClick={(e) => handleCopy(e, email, "E-mail")}
                            >
                                <Mail size={14} className="text-gray-400 group-hover/value:text-primary transition-colors" />
                                <div className="flex items-center gap-1 min-w-0">
                                    <span className="text-xs font-bold text-gray-600 truncate max-w-[180px]" title={email}>
                                        {email}
                                    </span>
                                    <Copy size={10} className="text-gray-300 opacity-0 group-hover/value:opacity-100 transition-all" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Subtle bottom highlight on hover */}
            <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-primary/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-full" />
        </div>

    );
}
