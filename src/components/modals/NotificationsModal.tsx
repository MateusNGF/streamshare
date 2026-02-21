"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { NotificationCard } from "@/components/notifications/NotificationCard";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Bell, CheckCheck, Clock } from "lucide-react";
import { getNotificacoes, marcarComoLida, marcarTodasComoLidas } from "@/actions/notificacoes";
import { useToast } from "@/hooks/useToast";
import { TipoNotificacao } from "@prisma/client";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/Select";

interface NotificationsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type FilterCategory = {
    id: string;
    label: string;
    types?: TipoNotificacao[];
    unread?: boolean;
};

const FILTERS: FilterCategory[] = [
    { id: 'all', label: 'Todas' },
    { id: 'unread', label: 'Não Lidas', unread: true },
    {
        id: 'participantes',
        label: 'Participantes',
        types: ['participante_criado', 'participante_editado', 'participante_excluido']
    },
    {
        id: 'streamings',
        label: 'Streamings',
        types: ['streaming_criado', 'streaming_editado', 'streaming_excluido']
    },
    {
        id: 'assinaturas',
        label: 'Assinaturas',
        types: ['assinatura_criada', 'assinatura_editada', 'assinatura_suspensa', 'assinatura_cancelada', 'assinatura_renovada']
    },
    {
        id: 'financeiro',
        label: 'Financeiro',
        types: ['cobranca_gerada', 'cobranca_confirmada', 'cobranca_cancelada', 'plano_alterado']
    },
    {
        id: 'grupos',
        label: 'Grupos',
        types: ['grupo_criado', 'grupo_editado', 'grupo_excluido']
    },
    {
        id: 'convites',
        label: 'Convites',
        types: ['convite_recebido', 'convite_aceito', 'solicitacao_participacao_criada', 'solicitacao_participacao_aceita', 'solicitacao_participacao_recusada']
    },
    {
        id: 'suporte',
        label: 'Suporte',
        types: ['suporte_atualizado']
    },
    {
        id: 'sistema',
        label: 'Sistema',
        types: ['configuracao_alterada', 'plano_alterado']
    },
];

const TIME_FILTERS = [
    { value: 'all', label: 'Todo o periodo' },
    { value: '24h', label: 'Últimas 24h' },
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '30d', label: 'Últimos 30 dias' },
];

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
    const [notificacoes, setNotificacoes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [naoLidas, setNaoLidas] = useState(0);
    const [activeFilter, setActiveFilter] = useState('all');
    const [timeFilter, setTimeFilter] = useState('all');
    const toast = useToast();

    const loadNotificacoes = async (isLoadMore = false) => {
        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
            setOffset(0);
        }

        try {
            const currentFilter = FILTERS.find(f => f.id === activeFilter);
            const currentOffset = isLoadMore ? offset + 50 : 0;

            let dataInicio: Date | undefined;
            if (timeFilter !== 'all') {
                const now = new Date();
                switch (timeFilter) {
                    case '24h':
                        dataInicio = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                        break;
                    case '7d':
                        dataInicio = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        break;
                    case '30d':
                        dataInicio = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        break;
                }
            }

            const result = await getNotificacoes({
                limite: 50,
                offset: currentOffset,
                apenasNaoLidas: currentFilter?.unread,
                tipos: currentFilter?.types,
                dataInicio
            });

            if (result.success && result.data) {
                if (isLoadMore) {
                    setNotificacoes(prev => [...prev, ...result.data.notificacoes]);
                } else {
                    setNotificacoes(result.data.notificacoes);
                }

                setHasMore(result.data.notificacoes.length === 50);
                setOffset(currentOffset);

                if (activeFilter === 'all' && timeFilter === 'all' && !isLoadMore) {
                    setNaoLidas(result.data.naoLidas);
                }
            } else if (result.error) {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Erro ao carregar notificações");
            console.error(error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadNotificacoes(false);
        }
    }, [isOpen, activeFilter, timeFilter]);

    const handleMarkAsRead = async (id: number) => {
        try {
            const result = await marcarComoLida(id);
            if (result.success) {
                setNotificacoes(prev =>
                    prev.map(n => n.id === id ? { ...n, lida: true } : n)
                );
                setNaoLidas(prev => Math.max(0, prev - 1));
                toast.success("Notificação marcada como lida");
            } else if (result.error) {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Erro ao marcar notificação");
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const result = await marcarTodasComoLidas();
            if (result.success) {
                setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
                setNaoLidas(0);
                toast.success("Todas as notificações marcadas como lidas");
            } else if (result.error) {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Erro ao marcar todas como lidas");
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Notificações"
            className="sm:max-w-3xl"
            footer={
                naoLidas > 0 ? (
                    <div className="flex justify-end w-full">
                        <Button
                            variant="outline"
                            onClick={handleMarkAllAsRead}
                            className="gap-2"
                        >
                            <CheckCheck size={16} />
                            Marcar todas como lidas
                        </Button>
                    </div>
                ) : undefined
            }
        >
            {/* Filters Container */}
            <div className="mb-4 flex flex-col gap-3">
                {/* Category Filters */}
                <div className="-mx-6 px-6 overflow-x-auto pb-2 scrollbar-hide">
                    <div className="flex items-center gap-2">
                        {FILTERS.map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200",
                                    activeFilter === filter.id
                                        ? "bg-primary text-white shadow-md shadow-primary/20"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                )}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Time Filters & Info */}
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <Select value={timeFilter} onValueChange={setTimeFilter}>
                            <SelectTrigger className="w-[180px] h-8 text-xs border-gray-200 bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                                <div className="flex items-center gap-2">
                                    <Clock size={13} className="text-gray-500" />
                                    <SelectValue placeholder="Selecione o período" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                {TIME_FILTERS.map((tf) => (
                                    <SelectItem key={tf.value} value={tf.value} className="text-xs">
                                        {tf.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {loading && <span className="text-[10px] text-gray-400 animate-pulse">Atualizando...</span>}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Spinner />
                </div>
            ) : notificacoes.length === 0 ? (
                <div className="py-8">
                    <EmptyState
                        icon={activeFilter === 'unread' ? CheckCheck : Bell}
                        title="Nenhuma notificação"
                        description={
                            activeFilter === 'unread'
                                ? "Você leu todas as notificações!"
                                : "Não há notificações para este filtro."
                        }
                    />
                </div>
            ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                    {notificacoes.map((notificacao) => (
                        <NotificationCard
                            key={notificacao.id}
                            id={notificacao.id}
                            tipo={notificacao.tipo}
                            titulo={notificacao.titulo}
                            descricao={notificacao.descricao}
                            usuario={notificacao.usuario}
                            metadata={notificacao.metadata}
                            createdAt={notificacao.createdAt}
                            lida={notificacao.lida}
                            onMarkAsRead={handleMarkAsRead}
                        />
                    ))}
                    {hasMore && notificacoes.length > 0 && (
                        <div className="py-4 flex justify-center">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => loadNotificacoes(true)}
                                disabled={loadingMore}
                                className="w-full sm:w-auto"
                            >
                                {loadingMore ? "Carregando..." : "Carregar mais"}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
}
