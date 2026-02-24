"use client";

import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
    Phone,
    Mail,
    CreditCard,
    User,
    AlertCircle,
    Edit,
    Calendar,
    UserCheck,
    ChevronRight,
    Copy,
    CheckCircle2,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { getDetailsParticipanteById } from "@/actions/participantes";
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

/**
 * Componente Principal de Detalhes do Participante
 * Segue o Princípio de Responsabilidade Única (SRP) orquestrando sub-componentes especializados.
 */
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
            toast.error("Não foi possível carregar os detalhes do participante.");
        } finally {
            setLoading(false);
        }
    };

    const isLinked = useMemo(() => !!participant?.userId, [participant?.userId]);

    if (!participantId) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Detalhes do Participante"
            className="sm:max-w-2xl"
            footer={
                <div className="flex flex-col-reverse sm:flex-row items-center gap-3 w-full">
                    {/* Ação primária (Edit) fica na base em mobile (order-2) */}
                    {!loading && participant && (
                        <Button
                            onClick={() => {
                                onEdit(participant);
                                onClose();
                            }}
                            className="w-full sm:w-auto order-2 sm:order-2"
                        >
                            <Edit size={18} />
                            Editar Perfil
                        </Button>
                    )}

                    {/* Ação secundária (Fechar) fica no topo em mobile (order-1) e na extrema esquerda no desktop (mr-auto) */}
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="w-full sm:w-auto sm:mr-auto order-1 sm:order-1"
                    >
                        Fechar
                    </Button>
                </div>
            }
        >
            <div className="space-y-8 py-2">
                {/* Cabeçalho do Perfil */}
                <ParticipantHeader
                    participant={participant}
                    loading={loading}
                    isLinked={isLinked}
                />

                {/* Alerta de Conta Vinculada */}
                {isLinked && !loading && <LinkedAccountAlert />}

                {/* Grid de Informações Pessoais */}
                <PersonalInfoSection
                    participant={participant}
                    loading={loading}
                />

                {/* Seção de Assinaturas */}
                <ActiveSubscriptionsSection
                    participant={participant}
                    loading={loading}
                />
            </div>
        </Modal>
    );
}

/**
 * Sub-componente para o cabeçalho do participante
 */
function ParticipantHeader({ participant, loading, isLinked }: { participant: any, loading: boolean, isLinked: boolean }) {
    if (loading) {
        return (
            <div className="flex items-center gap-5">
                <Skeleton variant="rectangular" className="w-20 h-20 rounded-2xl" />
                <div className="space-y-3">
                    <Skeleton variant="text" className="w-48 h-8" />
                    <Skeleton variant="text" className="w-24 h-5" />
                </div>
            </div>
        );
    }

    if (!participant) return null;

    return (
        <div className="flex items-center gap-5 animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="relative">
                <div
                    className="w-20 h-20 rounded-2xl bg-violet-100/50 text-primary flex items-center justify-center font-bold text-3xl shadow-sm border border-violet-200"
                    role="img"
                    aria-label={`Iniciais do participante: ${participant.nome.charAt(0).toUpperCase()}`}
                >
                    {participant.nome.charAt(0).toUpperCase()}
                </div>
                {isLinked && (
                    <div
                        className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1.5 rounded-lg border-2 border-white shadow-md"
                        title="Participante Vinculado"
                        role="status"
                        aria-label="Vinculado"
                    >
                        <UserCheck size={14} />
                    </div>
                )}
            </div>
            <div className="space-y-1.5 min-w-0">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight leading-tight truncate">
                    {participant.nome}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={participant.status} className="h-6" />
                    {isLinked && (
                        <span
                            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100"
                            role="status"
                        >
                            <User size={10} aria-hidden="true" />
                            Perfil Ativo
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * Sub-componente de alerta para conta vinculada
 */
function LinkedAccountAlert() {
    return (
        <div
            className="bg-blue-50 border border-blue-100 p-4 md:p-5 rounded-3xl flex gap-4 items-start animate-in fade-in slide-in-from-top-2 duration-500"
            role="alert"
        >
            <div className="bg-blue-100/80 p-2.5 rounded-2xl text-blue-600 shrink-0">
                <AlertCircle size={20} aria-hidden="true" />
            </div>
            <div className="space-y-0.5">
                <p className="font-bold text-blue-900 leading-tight">Gestão pelo Participante</p>
                <p className="text-blue-700/80 text-xs leading-relaxed font-medium">
                    Este perfil está vinculado a uma conta ativa. Algumas informações cadastrais são gerenciadas pelo próprio usuário para garantir segurança e privacidade.
                </p>
            </div>
        </div>
    );
}

/**
 * Sub-componente para informações pessoais
 */
function PersonalInfoSection({ participant, loading }: { participant: any, loading: boolean }) {
    const toast = useToast();

    const handleCopy = (text: string | null, label: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        toast.info(`${label} copiado com sucesso!`);
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-100 p-4 md:p-6 space-y-6 shadow-sm">
            <div className="flex items-center gap-2.5 text-gray-900 mb-2 px-1">
                <div className="p-1.5 bg-violet-50 rounded-lg text-primary">
                    <User size={18} aria-hidden="true" />
                </div>
                <h4 className="font-bold text-sm md:text-base uppercase tracking-tight">Informações Pessoais</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">
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
                    placeholder="N/A"
                />
            </div>
        </div>
    );
}

/**
 * Sub-componente para item de informação com opção de cópia
 */
interface InfoItemProps {
    label: string;
    value: string | null;
    icon: any;
    loading: boolean;
    placeholder: string;
    onCopy?: () => void;
}

function InfoItem({ label, value, icon: Icon, loading, placeholder, onCopy }: InfoItemProps) {
    const [copied, setCopied] = useState(false);

    const handleAction = () => {
        if (onCopy && value) {
            onCopy();
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleAction();
        }
    };

    return (
        <div className="space-y-2 flex flex-col">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none px-1">
                {label}
            </p>
            {loading ? (
                <Skeleton variant="text" className="w-3/4 h-5 mt-1" />
            ) : (
                <div
                    className={cn(
                        "flex items-center gap-4 p-3 -ml-3 rounded-2xl border border-transparent transition-all group outline-none focus-visible:bg-violet-50/50 focus-visible:ring-2 focus-visible:ring-primary/20",
                        onCopy && value ? "cursor-pointer hover:bg-gray-50/80 hover:border-gray-100 touch-manipulation" : ""
                    )}
                    onClick={handleAction}
                    onKeyDown={handleKeyDown}
                    role={onCopy && value ? "button" : undefined}
                    tabIndex={onCopy && value ? 0 : undefined}
                    aria-label={onCopy && value ? `Copiar ${label}: ${value}` : undefined}
                >
                    <div className="flex-shrink-0 bg-gray-50 p-2.5 rounded-xl group-hover:bg-violet-50 group-hover:text-primary group-focus-visible:bg-violet-100 transition-all shadow-sm">
                        <Icon size={16} className={cn("text-gray-400 transition-colors", value && "text-primary/70 group-hover:text-primary")} aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className={cn(
                            "text-sm font-bold block truncate tracking-tight",
                            !value ? "text-gray-300 font-medium italic" : "text-gray-900"
                        )}>
                            {value || placeholder}
                        </span>
                    </div>
                    {onCopy && value && (
                        <div className={cn(
                            "flex-shrink-0 p-2 rounded-lg transition-all",
                            copied
                                ? "bg-green-50 text-green-600 scale-110 opacity-100"
                                : "text-gray-300 opacity-60 md:opacity-0 md:group-hover:opacity-100 md:group-hover:text-primary md:group-hover:bg-white shadow-sm group-focus-visible:opacity-100"
                        )}>
                            {copied ? <CheckCircle2 size={14} /> : <Copy size={14} aria-hidden="true" />}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/**
 * Seção de Assinaturas Ativas
 */
function ActiveSubscriptionsSection({ participant, loading }: { participant: any, loading: boolean }) {
    return (
        <div className="space-y-5 px-1">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-violet-50 rounded-lg text-primary">
                        <CreditCard size={18} aria-hidden="true" />
                    </div>
                    <h4 className="font-bold text-sm md:text-base uppercase tracking-tight">Assinaturas Ativas</h4>
                </div>
                {!loading && (
                    <span
                        className="text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 px-3.5 py-1.5 rounded-full border border-gray-200 shadow-sm"
                        aria-label={`${participant?.assinaturas?.length || 0} assinaturas no total`}
                    >
                        {(participant?.assinaturas?.length || 0).toString().padStart(2, '0')} TOTAL
                    </span>
                )}
            </div>

            {loading ? (
                <div className="space-y-4">
                    <Skeleton variant="rectangular" className="w-full h-24 rounded-3xl" />
                    <Skeleton variant="rectangular" className="w-full h-24 rounded-3xl" />
                </div>
            ) : participant?.assinaturas?.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {participant.assinaturas.slice(0, 5).map((sub: any) => (
                        <SubscriptionItemCard key={sub.id} sub={sub} />
                    ))}

                    {participant.assinaturas.length > 5 && (
                        <Link
                            href={`/assinaturas?participanteId=${participant.id}`}
                            className="flex items-center justify-center gap-3 p-4 text-sm font-bold text-primary bg-primary/5 hover:bg-primary/10 rounded-2xl border border-dashed border-primary/30 transition-all group/link focus-visible:ring-2 focus-visible:ring-primary/40 outline-none"
                        >
                            Ver todas as {participant.assinaturas.length} assinaturas
                            <ChevronRight size={18} className="group-hover/link:translate-x-1.5 transition-transform" aria-hidden="true" />
                        </Link>
                    )}
                </div>
            ) : (
                <div className="bg-gray-50 border border-dashed border-gray-200 p-8 md:p-12 rounded-[32px] text-center flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-2 shadow-sm border border-gray-100">
                        <AlertCircle size={24} className="text-gray-300" aria-hidden="true" />
                    </div>
                    <p className="text-gray-500 font-bold mb-0.5">Nenhuma assinatura ativa</p>
                    <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                        Este participante não possui streamings vinculados ou faturas pendentes de processamento.
                    </p>
                </div>
            )}
        </div>
    );
}

/**
 * Card individual de assinatura
 */
function SubscriptionItemCard({ sub }: { sub: any }) {
    return (
        <div
            className="bg-white border border-gray-100 p-4 md:p-5 rounded-3xl flex items-center justify-between hover:border-violet-200 hover:shadow-md transition-all group animate-in zoom-in-95 duration-300"
            role="article"
            aria-label={`Assinatura ${sub.streaming.catalogo.nome}, valor ${formatarMoeda(sub.valor)}, status ${sub.status}`}
        >
            <div className="flex items-center gap-4">
                <StreamingLogo
                    name={sub.streaming.catalogo.nome}
                    color={sub.streaming.catalogo.corPrimaria || "#000"}
                    iconeUrl={sub.streaming.catalogo.iconeUrl}
                    size="lg"
                    rounded="2xl"
                />
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 leading-tight">
                            {sub.streaming.catalogo.nome}
                        </p>
                        {sub.streaming.apelido && (
                            <span
                                className="text-[9px] font-black uppercase tracking-wider bg-violet-50 text-primary px-2 py-0.5 rounded-md border border-violet-100"
                                aria-label={`Apelido: ${sub.streaming.apelido}`}
                            >
                                {sub.streaming.apelido}
                            </span>
                        )}
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{sub.frequencia}</p>
                </div>
            </div>
            <div className="text-right flex flex-col items-end gap-2">
                <p className="font-black text-gray-900 text-lg md:text-xl tracking-tight leading-none group-hover:text-primary transition-colors">
                    {formatarMoeda(sub.valor)}
                </p>
                <StatusBadge status={sub.status} className="scale-90 origin-right" />
            </div>
        </div>
    );
}
