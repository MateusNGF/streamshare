"use client";

import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import { Phone, Mail, CreditCard, User, AlertCircle, Edit, Calendar, UserCheck, ChevronRight, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { getDetailsParticipanteById } from "@/actions/participantes";
import { Spinner } from "@/components/ui/Spinner";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatarMoeda } from "@/lib/financeiro-utils";
import { Participante } from "@/types/participante";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import Link from "next/link";
import { useToast } from "@/hooks/useToast";

interface DetalhesParticipanteModalProps {
    isOpen: boolean;
    onClose: () => void;
    participantId: number | null;
    onEdit: (participant: Participante) => void;
}

export function DetalhesParticipanteModal({
    isOpen,
    onClose,
    participantId,
    onEdit,
}: DetalhesParticipanteModalProps) {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [participant, setParticipant] = useState<any>(null);

    useEffect(() => {
        if (isOpen && participantId) {
            fetchParticipant();
        }
    }, [isOpen, participantId]);

    const handleCopy = (text: string, label: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.info(`${label} copiado!`);
    };

    const fetchParticipant = async () => {
        if (!participantId) return;
        setLoading(true);
        try {
            const result = await getDetailsParticipanteById(participantId);
            if (result.success) {
                setParticipant(result.data);
            }
        } catch (error) {
            console.error("Erro ao carregar participante", error);
        } finally {
            setLoading(false);
        }
    };

    if (!participantId) return null;

    const isLinked = !!participant?.userId;

    const renderHeader = () => {
        if (loading) {
            return (
                <div className="flex items-center gap-4">
                    <Skeleton variant="rectangular" className="w-20 h-20 rounded-2xl" />
                    <div className="space-y-2">
                        <Skeleton variant="text" className="w-48 h-8" />
                        <Skeleton variant="text" className="w-24 h-5" />
                    </div>
                </div>
            );
        }

        if (!participant) return null;

        return (
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-violet-100 text-primary flex items-center justify-center font-bold text-3xl shadow-sm border border-violet-200">
                        {participant.nome.charAt(0).toUpperCase()}
                    </div>
                    {isLinked && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-lg border-2 border-white shadow-sm" title="Participante Vinculado">
                            <UserCheck size={14} />
                        </div>
                    )}
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 leading-tight">{participant.nome}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <StatusBadge status={participant.status} />
                        {isLinked && (
                            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">
                                <User size={10} />
                                Perfil Ativo
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Detalhes do Participante"
            footer={
                <div className="flex flex-col-reverse sm:flex-row items-center gap-3 w-full">
                    {!loading && participant && (
                        <button
                            onClick={() => {
                                onEdit(participant);
                                onClose();
                            }}
                            className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-accent text-white rounded-xl font-bold shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2"
                        >
                            <Edit size={18} />
                            Editar Perfil
                        </button>
                    )}
                </div>
            }
        >
            <div className="space-y-8">
                {/* Header Section */}
                {renderHeader()}

                {isLinked && !loading && (
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-3xl flex gap-3 items-start animate-fade-in">
                        <div className="bg-blue-100 p-2 rounded-2xl text-blue-600 shrink-0">
                            <AlertCircle size={20} />
                        </div>
                        <div className="text-sm">
                            <p className="font-bold text-blue-900 mb-0.5">Gestão pelo Participante</p>
                            <p className="text-blue-700/80 leading-relaxed font-medium">Este perfil está vinculado a uma conta ativa. Algumas informações cadastrais são gerenciadas pelo próprio usuário.</p>
                        </div>
                    </div>
                )}

                {/* Personal Information */}
                <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 space-y-6">
                    <div className="flex items-center gap-2 text-gray-900 mb-2">
                        <User size={20} className="text-primary" />
                        <h4 className="font-bold">Informações Pessoais</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <InfoItem
                            label="WhatsApp"
                            value={participant?.whatsappNumero}
                            icon={Phone}
                            loading={loading}
                            placeholder="Não informado"
                            onCopy={() => handleCopy(participant?.whatsappNumero, "WhatsApp")}
                        />
                        <InfoItem
                            label="E-mail"
                            value={participant?.email}
                            icon={Mail}
                            loading={loading}
                            placeholder="Não informado"
                            onCopy={() => handleCopy(participant?.email, "E-mail")}
                        />
                        <InfoItem
                            label="CPF"
                            value={participant?.cpf}
                            icon={CreditCard}
                            loading={loading}
                            placeholder="Não cadastrado"
                            onCopy={() => handleCopy(participant?.cpf, "CPF")}
                        />
                        <InfoItem
                            label="Membro desde"
                            value={participant?.createdAt ? new Date(participant.createdAt).toLocaleDateString() : null}
                            icon={Calendar}
                            loading={loading}
                        />
                    </div>
                </div>

                {/* Subscriptions Section */}
                <div className="space-y-4 px-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CreditCard size={20} className="text-primary" />
                            <h4 className="text-lg font-bold text-gray-900">Assinaturas Ativas</h4>
                        </div>
                        {!loading && (
                            <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                                {participant?.assinaturas?.length || 0} TOTAL
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            <Skeleton variant="rectangular" className="w-full h-20" />
                            <Skeleton variant="rectangular" className="w-full h-20" />
                        </div>
                    ) : participant?.assinaturas?.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3">
                            {participant.assinaturas.slice(0, 5).map((sub: any) => (
                                <SubscriptionItem key={sub.id} sub={sub} />
                            ))}
                            {participant.assinaturas.length > 5 && (
                                <Link
                                    href={`/assinaturas?participanteId=${participant.id}`}
                                    className="flex items-center justify-center gap-2 p-3 text-sm font-bold text-primary hover:bg-primary/5 rounded-xl border border-dashed border-primary/20 transition-all hover:border-primary/40 group/link"
                                >
                                    Ver todas as {participant.assinaturas.length} assinaturas
                                    <ChevronRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="bg-gray-50 border border-dashed border-gray-200 p-10 rounded-[32px] text-center">
                            <p className="text-gray-400 font-bold mb-1">Nenhuma assinatura ativa</p>
                            <p className="text-sm text-gray-400">Este participante não possui streamings vinculados no momento.</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}

function InfoItem({ label, value, icon: Icon, loading, placeholder, onCopy }: any) {
    return (
        <div className="space-y-1.5 flex flex-col">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none px-1">{label}</p>
            {loading ? (
                <Skeleton variant="text" className="w-3/4 h-5 mt-1" />
            ) : (
                <div
                    className={cn(
                        "flex items-center gap-3 p-1 rounded-xl border border-transparent transition-all group",
                        onCopy && value ? "cursor-pointer hover:bg-gray-50/50 hover:border-gray-100" : ""
                    )}
                    onClick={onCopy}
                >
                    <div className="flex-shrink-0 bg-gray-50 p-2 rounded-lg group-hover:bg-violet-50 transition-colors shadow-sm">
                        <Icon size={16} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className={cn(
                            "text-sm font-bold block truncate",
                            !value ? "text-gray-400 font-medium" : "text-gray-900"
                        )}>
                            {value || placeholder}
                        </span>
                    </div>
                    {onCopy && value && (
                        <div className="flex-shrink-0 p-1.5 text-gray-300 group-hover:text-primary group-hover:bg-white rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                            <Copy size={14} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function SubscriptionItem({ sub }: { sub: any }) {
    return (
        <div className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between hover:bg-gray-50/50 transition-all hover:shadow-sm">
            <div className="flex items-center gap-3">
                <StreamingLogo
                    name={sub.streaming.catalogo.nome}
                    color={sub.streaming.catalogo.corPrimaria || "#000"}
                    iconeUrl={sub.streaming.catalogo.iconeUrl}
                    size="lg"
                    rounded="xl"
                />
                <div>
                    <p className="font-bold text-gray-900 leading-tight">
                        {sub.streaming.catalogo.nome}
                        {sub.streaming.apelido && (
                            <span className="text-primary text-[10px] font-black uppercase tracking-wider bg-violet-50 px-1.5 py-0.5 rounded ml-2 border border-violet-100">
                                {sub.streaming.apelido}
                            </span>
                        )}
                    </p>
                    <p className="text-[10px] font-black text-gray-500 mt-1 uppercase tracking-widest">{sub.frequencia}</p>
                </div>
            </div>
            <div className="text-right flex flex-col items-end gap-1.5">
                <p className="font-black text-gray-900 text-lg leading-none">{formatarMoeda(sub.valor)}</p>
                <StatusBadge status={sub.status} />
            </div>
        </div>
    );
}
