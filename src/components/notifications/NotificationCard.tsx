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
    solicitacao_participacao_criada: "symbol",
    solicitacao_participacao_aceita: "symbol",
    solicitacao_participacao_recusada: "symbol",
    convite_recebido: "symbol",
    convite_aceito: "symbol",
    suporte_atualizado: "symbol"
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
    solicitacao_participacao_criada: "",
    solicitacao_participacao_aceita: "",
    solicitacao_participacao_recusada: "",
    convite_recebido: "",
    convite_aceito: "",
    suporte_atualizado: ""
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
                group relative w-full p-2.5 rounded-lg border transition-all duration-300 ease-out
                flex items-start gap-2.5 /* List item gap */
                ${lida
                    ? "bg-white border-transparent hover:border-gray-200 opacity-75 hover:opacity-100"
                    : "bg-white border-l-[3px] border-l-primary shadow-sm shadow-primary/5 hover:shadow-md hover:shadow-primary/10"
                }
            `}
        >
            {/* Icon - Compact & Centered */}
            <div className={`
                shrink-0 w-7 h-7 rounded-md flex items-center justify-center 
                transition-transform duration-300 group-hover:scale-110
                mt-0.5 /* Align with title */
                z-10 
                ${colorClass}
            `}>
                <Icon size={14} strokeWidth={2.5} />
            </div>

            {/* Content Wrapper */}
            <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <h4 className={`text-xs leading-snug transition-colors duration-200 break-words ${!lida ? "font-bold text-gray-900" : "font-medium text-gray-600"}`}>
                        {titulo}
                    </h4>

                    {/* Time */}
                    <span className="shrink-0 text-[9px] font-medium text-gray-400 whitespace-nowrap pt-0.5">
                        {timeAgo}
                    </span>
                </div>

                {descricao && (
                    <p className={`text-[11px] leading-snug transition-colors duration-200 break-words ${!lida ? "text-gray-600" : "text-gray-400"}`}>
                        {descricao}
                    </p>
                )}

                {/* Footer Meta */}
                <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2 overflow-hidden">
                        {usuario && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gray-50 border border-gray-100 max-w-full">
                                <Users size={9} className="text-gray-400 shrink-0" />
                                <span className="text-[9px] font-medium text-gray-600 truncate max-w-[80px]">
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
                                flex items-center gap-1 px-1.5 py-0.5 -mr-1 text-[8px] font-bold tracking-wide uppercase
                                text-primary bg-primary/5 hover:bg-primary/10 rounded-md 
                                transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100
                                sm:opacity-0 /* Hidden by default on desktop until hover */
                                opacity-100 /* Always visible on mobile if unread */
                            "
                            aria-label="Marcar como lida"
                        >
                            <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                            Lida
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
