"use client";

import { TipoNotificacao } from "@prisma/client";
import {
    Users, Tv, FileSignature, CreditCard, FolderOpen, Settings, Zap,
    UserPlus, Edit, Trash2, CheckCircle, XCircle, Bell
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface NotificationCardProps {
    id: number;
    tipo: TipoNotificacao;
    titulo: string;
    descricao?: string;
    usuario?: { nome: string } | null;
    metadata?: Record<string, any> | null;
    createdAt: Date;
    lida: boolean;
    onMarkAsRead: (id: number) => void;
}

const iconMap: Record<TipoNotificacao, React.ElementType> = {
    participante_criado: UserPlus,
    participante_editado: Edit,
    participante_excluido: Trash2,
    streaming_criado: Tv,
    streaming_editado: Edit,
    streaming_excluido: Trash2,
    assinatura_criada: FileSignature,
    assinatura_editada: Edit,
    assinatura_suspensa: XCircle,
    assinatura_cancelada: XCircle,
    assinatura_renovada: CheckCircle,
    cobranca_gerada: CreditCard,
    cobranca_confirmada: CheckCircle,
    cobranca_cancelada: XCircle,
    grupo_criado: FolderOpen,
    grupo_editado: Edit,
    grupo_excluido: Trash2,
    configuracao_alterada: Settings,
    plano_alterado: Zap,
};

const colorMap: Record<TipoNotificacao, string> = {
    participante_criado: "bg-blue-50 text-blue-600",
    participante_editado: "bg-amber-50 text-amber-600",
    participante_excluido: "bg-red-50 text-red-600",
    streaming_criado: "bg-purple-50 text-purple-600",
    streaming_editado: "bg-amber-50 text-amber-600",
    streaming_excluido: "bg-red-50 text-red-600",
    assinatura_criada: "bg-green-50 text-green-600",
    assinatura_editada: "bg-amber-50 text-amber-600",
    assinatura_suspensa: "bg-orange-50 text-orange-600",
    assinatura_cancelada: "bg-red-50 text-red-600",
    assinatura_renovada: "bg-green-50 text-green-600",
    cobranca_gerada: "bg-blue-50 text-blue-600",
    cobranca_confirmada: "bg-green-50 text-green-600",
    cobranca_cancelada: "bg-red-50 text-red-600",
    grupo_criado: "bg-indigo-50 text-indigo-600",
    grupo_editado: "bg-amber-50 text-amber-600",
    grupo_excluido: "bg-red-50 text-red-600",
    configuracao_alterada: "bg-gray-50 text-gray-600",
    plano_alterado: "bg-violet-50 text-violet-600",
};

export function NotificationCard({
    id,
    tipo,
    titulo,
    descricao,
    usuario,
    createdAt,
    lida,
    onMarkAsRead
}: NotificationCardProps) {
    const Icon = iconMap[tipo] || Bell;
    const colorClass = colorMap[tipo] || "bg-gray-50 text-gray-600";

    const timeAgo = formatDistanceToNow(new Date(createdAt), {
        addSuffix: true,
        locale: ptBR
    });

    return (
        <div
            className={`
                group relative w-full p-4 rounded-xl border transition-all duration-300 ease-out
                flex items-start gap-4 /* Flex layout for robust spacing */
                ${lida
                    ? "bg-white border-transparent hover:border-gray-200 opacity-75 hover:opacity-100"
                    : "bg-white border-l-4 border-l-primary shadow-sm shadow-primary/5 hover:shadow-md hover:shadow-primary/10"
                }
            `}
        >
            {/* Icon - Flex Item (Safe from overlap) */}
            <div className={`
                shrink-0 w-10 h-10 rounded-xl flex items-center justify-center 
                transition-transform duration-300 group-hover:scale-110
                z-10 /* Ensure above any decorative elements */
                ${colorClass}
            `}>
                <Icon size={20} strokeWidth={2.5} />
            </div>

            {/* Content Wrapper */}
            <div className="flex-1 flex flex-col gap-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                    <h4 className={`text-sm leading-tight transition-colors duration-200 break-words ${!lida ? "font-bold text-gray-900" : "font-medium text-gray-600"}`}>
                        {titulo}
                    </h4>

                    {/* Time */}
                    <span className="shrink-0 text-[10px] font-medium text-gray-400 whitespace-nowrap pt-0.5">
                        {timeAgo}
                    </span>
                </div>

                {descricao && (
                    <p className={`text-xs leading-relaxed transition-colors duration-200 break-words ${!lida ? "text-gray-600" : "text-gray-400"}`}>
                        {descricao}
                    </p>
                )}

                {/* Footer Meta */}
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                        {usuario && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-50 border border-gray-100 max-w-full">
                                <Users size={10} className="text-gray-400 shrink-0" />
                                <span className="text-[10px] font-medium text-gray-600 truncate">
                                    {usuario.nome}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Mark as read button */}
                    {!lida && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onMarkAsRead(id);
                            }}
                            className="
                                flex items-center gap-1.5 px-3 py-1 -mr-2 text-[10px] font-semibold tracking-wide uppercase
                                text-primary bg-primary/5 hover:bg-primary/10 rounded-md 
                                transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100
                                sm:opacity-0 /* Hidden by default on desktop until hover */
                                opacity-100 /* Always visible on mobile if unread */
                            "
                            aria-label="Marcar como lida"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            Lida
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
