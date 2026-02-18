import { Phone, Mail, CreditCard, Edit, Trash2, Eye, User } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

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
    const initial = name.charAt(0).toUpperCase();
    const isLinked = !!userId;

    return (
        <div
            className={cn(
                "group relative bg-white p-5 md:p-6 rounded-[32px] border border-gray-100 transition-all duration-500",
                "hover:shadow-[0_20px_50px_rgba(109,40,217,0.08)] hover:-translate-y-1 hover:border-primary/10"
            )}
        >
            <div className="flex items-start justify-between mb-6">
                <div
                    className="flex items-center gap-4 cursor-pointer flex-1"
                    onClick={onView}
                >
                    <div className="relative">
                        <div className={cn(
                            "w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center font-black text-2xl transition-all duration-500 shadow-sm",
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
                    <div className="space-y-1">
                        <h3 className="font-black text-gray-900 text-lg leading-tight group-hover:text-primary transition-colors">
                            {name}
                        </h3>
                        <div className="flex items-center gap-2">
                            <StatusBadge status={status} className="scale-90 origin-left" />
                            {isLinked && (
                                <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                    Vinculado
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Floating Actions */}
                <div className="flex items-center gap-1.5 p-1.5 bg-gray-50/50 backdrop-blur-sm rounded-2xl border border-transparent group-hover:border-gray-100 group-hover:bg-white/80 transition-all duration-500 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0">
                    <button
                        onClick={onView}
                        className="p-2 hover:bg-primary/5 rounded-xl text-gray-400 hover:text-primary transition-all"
                        title="Ver Detalhes"
                    >
                        <Eye size={18} />
                    </button>
                    <button
                        onClick={onEdit}
                        className="p-2 hover:bg-primary/5 rounded-xl text-gray-400 hover:text-primary transition-all"
                        title="Editar"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-500 transition-all"
                        title="Excluir"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5 border-t border-gray-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-primary/60 group-hover:bg-violet-50 group-hover:text-primary transition-colors">
                        <CreditCard size={16} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Assinaturas</span>
                        <span className="text-sm font-bold text-gray-700">
                            {subscriptionsCount} ativa{subscriptionsCount !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-primary/60 group-hover:bg-violet-50 group-hover:text-primary transition-colors">
                        <Phone size={16} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">WhatsApp</span>
                        <span className="text-sm font-bold text-gray-700">
                            {whatsapp || "Não informado"}
                        </span>
                    </div>
                </div>

                {email && (
                    <div className="flex items-center gap-3 md:col-span-2">
                        <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-primary/60 group-hover:bg-violet-50 group-hover:text-primary transition-colors">
                            <Mail size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">E-mail</span>
                            <span className="text-sm font-bold text-gray-700 truncate max-w-[200px] md:max-w-md">
                                {email}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Hover Shine Effect */}
            <div className="absolute inset-0 rounded-[32px] bg-gradient-to-tr from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-700" />
        </div>
    );
}
