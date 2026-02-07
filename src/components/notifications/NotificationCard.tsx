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
            className={`relative flex gap-4 p-5 rounded-2xl border transition-all duration-200 ${lida
                ? "bg-white border-gray-100 hover:border-gray-200"
                : "bg-violet-50/50 border-violet-200 hover:border-violet-300"
                }`}
        >
            {/* Unread Indicator Dot */}
            {!lida && (
                <div className="absolute top-5 left-5 w-2 h-2 bg-primary rounded-full" />
            )}

            {/* Icon */}
            <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${colorClass}`}>
                <Icon size={20} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                    <h4 className={`text-sm text-gray-900 ${!lida ? "font-bold" : "font-semibold"}`}>
                        {titulo}
                    </h4>
                    {!lida && (
                        <button
                            onClick={() => onMarkAsRead(id)}
                            className="shrink-0 text-xs text-primary hover:text-primary/80 font-medium px-3 py-1.5 rounded-full hover:bg-primary/10 transition-all duration-200"
                        >
                            Marcar como lida
                        </button>
                    )}
                </div>

                {descricao && (
                    <p className="text-xs text-gray-600 mt-1.5 line-clamp-2 leading-relaxed">
                        {descricao}
                    </p>
                )}

                <div className="flex items-center gap-2 mt-2.5 text-xs text-gray-500">
                    {usuario && (
                        <>
                            <span className="font-medium">{usuario.nome}</span>
                            <span>•</span>
                        </>
                    )}
                    <span>{timeAgo}</span>
                </div>
            </div>
        </div>
    );
}
