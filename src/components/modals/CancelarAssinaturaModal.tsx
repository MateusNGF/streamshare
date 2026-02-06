"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface CancelarAssinaturaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    assinatura: {
        id: number;
        participante: {
            nome: string;
            whatsappNumero: string;
        };
        streaming: {
            apelido?: string;
            catalogo: {
                nome: string;
                iconeUrl?: string;
            };
        };
        valor: number;
        frequencia: string;
    } | null;
    loading: boolean;
}

export function CancelarAssinaturaModal({
    isOpen,
    onClose,
    onConfirm,
    assinatura,
    loading
}: CancelarAssinaturaModalProps) {
    if (!assinatura) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Cancelar Assinatura"
            footer={
                <div className="flex flex-col-reverse sm:flex-row w-full sm:justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                        className="w-full sm:w-auto"
                    >
                        Voltar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={loading}
                        className="w-full sm:w-auto"
                    >
                        {loading ? "Cancelando..." : "Confirmar Cancelamento"}
                    </Button>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Warning Alert */}
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h4 className="text-sm font-semibold text-amber-900">
                            Atenção: Esta ação é irreversível
                        </h4>
                        <p className="text-sm text-amber-800 mt-1">
                            O cancelamento é permanente e o participante será notificado via WhatsApp.
                        </p>
                    </div>
                </div>

                {/* Subscription Details */}
                <div className="space-y-3">
                    <div>
                        <label className="text-sm font-medium text-gray-500">Participante</label>
                        <div className="mt-1">
                            <p className="text-base font-medium text-gray-900">{assinatura.participante.nome}</p>
                            <p className="text-sm text-gray-600">{assinatura.participante.whatsappNumero}</p>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-500">Streaming</label>
                        <div className="mt-1 flex items-center gap-2">
                            {assinatura.streaming.catalogo.iconeUrl && (
                                <img
                                    src={assinatura.streaming.catalogo.iconeUrl}
                                    alt=""
                                    className="w-6 h-6 object-contain rounded-md bg-white p-0.5"
                                />
                            )}
                            <p className="text-base font-medium text-gray-900">
                                {assinatura.streaming.apelido || assinatura.streaming.catalogo.nome}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Frequência</label>
                            <p className="text-base font-medium text-gray-900 capitalize mt-1">
                                {assinatura.frequencia}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Valor</label>
                            <p className="text-base font-medium text-gray-900 mt-1">
                                {new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                }).format(Number(assinatura.valor))}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Consequences */}
                <div className="pt-2 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                        O que acontecerá:
                    </p>
                    <ul className="space-y-1 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                            <span className="text-gray-400 mt-0.5">•</span>
                            <span>A vaga no streaming será liberada para outros participantes</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-gray-400 mt-0.5">•</span>
                            <span>O participante receberá uma notificação via WhatsApp</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-gray-400 mt-0.5">•</span>
                            <span>Cobranças pendentes permanecerão no sistema</span>
                        </li>
                    </ul>
                </div>
            </div>
        </Modal>
    );
}
