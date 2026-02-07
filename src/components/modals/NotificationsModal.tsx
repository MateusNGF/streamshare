"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { NotificationCard } from "@/components/notifications/NotificationCard";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Bell, CheckCheck } from "lucide-react";
import { getNotificacoes, marcarComoLida, marcarTodasComoLidas } from "@/actions/notificacoes";
import { useToast } from "@/hooks/useToast";

interface NotificationsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
    const [notificacoes, setNotificacoes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [naoLidas, setNaoLidas] = useState(0);
    const toast = useToast();

    const loadNotificacoes = async () => {
        setLoading(true);
        try {
            const data = await getNotificacoes({ limite: 50 });
            setNotificacoes(data.notificacoes);
            setNaoLidas(data.naoLidas);
        } catch (error) {
            toast.error("Erro ao carregar notificações");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadNotificacoes();
        }
    }, [isOpen]);

    const handleMarkAsRead = async (id: number) => {
        try {
            await marcarComoLida(id);
            setNotificacoes(prev =>
                prev.map(n => n.id === id ? { ...n, lida: true } : n)
            );
            setNaoLidas(prev => Math.max(0, prev - 1));
            toast.success("Notificação marcada como lida");
        } catch (error) {
            toast.error("Erro ao marcar notificação");
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await marcarTodasComoLidas();
            setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
            setNaoLidas(0);
            toast.success("Todas as notificações marcadas como lidas");
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
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Spinner />
                </div>
            ) : notificacoes.length === 0 ? (
                <div className="py-8">
                    <EmptyState
                        icon={Bell}
                        title="Nenhuma notificação"
                        description="Você não tem notificações no momento. Todas as atividades importantes aparecerão aqui."
                    />
                </div>
            ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
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
                </div>
            )}
        </Modal>
    );
}
