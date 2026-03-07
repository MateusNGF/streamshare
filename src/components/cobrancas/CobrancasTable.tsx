"use client";

import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import { Trash, Clock, Search, History, QrCode, AlertCircle, User, TrendingUp, Calendar, DollarSign, Eye, Check, MessageCircle } from "lucide-react";
import React, { useState, useMemo, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/Checkbox";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

// Refactored Sub-components
import { CobrancaGroupHeader } from "./items/CobrancaGroupHeader";
import { CobrancaSelectableRow } from "./items/CobrancaSelectableRow";
import { CobrancaRow } from "./items/CobrancaRow";

interface CobrancasTableProps {
    cobrancas: any[];
    onViewDetails: (id: number) => void;
    onConfirmPayment?: (id: number) => void;
    onSendWhatsApp?: (id: number) => void;
    onCancelPayment?: (id: number) => void;
    onViewQrCode?: (id: number) => void;
    searchTerm?: string;
    statusFilter?: string;
    variant?: "default" | "compact";
    fallbackValorMensal?: number | string;
    isAdmin?: boolean;
    selectedIds?: Set<number>;
    onToggleSelect?: (id: number) => void;
    onSelectAll?: (ids: number[]) => void;
}

/**
 * SRP: Centraliza a lógica de quais ações estão disponíveis para uma cobrança.
 */
const getAvailableCobrancaActions = (cobranca: any, config: {
    isAdmin: boolean;
    onDetails: (id: number) => void;
    onQrCode?: (id: number) => void;
    onConfirm?: (id: number) => void;
    onWhatsApp?: (id: number) => void;
    onCancel?: (id: number) => void;
}) => {
    const { isAdmin, onDetails, onQrCode, onConfirm, onWhatsApp, onCancel } = config;

    const isPaid = cobranca.status === 'pago';
    const isCancelled = cobranca.status === 'cancelado';
    const isPendingOrOverdue = ['pendente', 'atrasado'].includes(cobranca.status);
    const canManageAdmin = !isPaid && !isCancelled && isAdmin;

    const actions: any[] = [
        {
            label: "Ver Detalhes",
            icon: <Eye size={16} />,
            onClick: () => onDetails(cobranca.id)
        }
    ];

    if (isPendingOrOverdue && !isAdmin) {
        actions.push({
            label: "Ver QR Code / PIX",
            icon: <QrCode size={16} />,
            onClick: () => onQrCode ? onQrCode(cobranca.id) : onDetails(cobranca.id)
        });
    }

    if (canManageAdmin) {
        actions.push({ type: "separator" as const });
        actions.push({
            label: "Confirmar Pagamento",
            icon: <Check size={16} />,
            onClick: () => onConfirm?.(cobranca.id)
        });
        actions.push({
            label: "Enviar WhatsApp",
            icon: <MessageCircle size={16} />,
            onClick: () => onWhatsApp?.(cobranca.id)
        });
        actions.push({ type: "separator" as const });
        actions.push({
            label: "Cancelar",
            icon: <AlertCircle size={16} />,
            onClick: () => onCancel?.(cobranca.id),
            variant: "danger" as const
        });
    }

    return actions;
};

export function CobrancasTable({
    cobrancas,
    onViewDetails,
    onConfirmPayment,
    onSendWhatsApp,
    onCancelPayment,
    onViewQrCode,
    searchTerm = "",
    statusFilter = "all",
    variant = "default",
    fallbackValorMensal,
    isAdmin = true,
    selectedIds,
    onToggleSelect,
    onSelectAll
}: CobrancasTableProps) {
    const isCompact = variant === "compact";
    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

    const toggleGroup = (groupName: string) => {
        setCollapsedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const selectableCobrancas = cobrancas.filter(c => ['pendente', 'atrasado'].includes(c.status));
    const allSelected = selectableCobrancas.length > 0 && selectedIds && selectableCobrancas.every(c => selectedIds.has(c.id));
    const someSelected = selectableCobrancas.length > 0 && selectedIds && !allSelected && selectableCobrancas.some(c => selectedIds.has(c.id));

    const handleSelectAll = (checked: boolean) => {
        if (!onSelectAll) return;
        if (checked) {
            onSelectAll(selectableCobrancas.map(c => c.id));
        } else {
            onSelectAll([]);
        }
    };

    // Smart Grouping Logic - Only group 'pendente' and 'atrasado'
    const groupedData = useMemo(() => {
        if (!isAdmin || isCompact) return { groups: null, individual: cobrancas };

        const groups: Record<string, any[]> = {};
        const individual: any[] = [];

        cobrancas.forEach(c => {
            const isGroupable = c.status === 'pendente' || c.status === 'atrasado';
            if (isGroupable) {
                const participantName = c.assinatura.participante.nome;
                if (!groups[participantName]) groups[participantName] = [];
                groups[participantName].push(c);
            } else {
                individual.push(c);
            }
        });

        return { groups, individual };
    }, [cobrancas, isAdmin, isCompact]);

    const groupedCobrancas = groupedData.groups;
    const individualCobrancas = groupedData.individual;
    const participantNames = groupedCobrancas ? Object.keys(groupedCobrancas) : [];

    const canSelectGroup = (participantName: string) => {
        if (!selectedIds || selectedIds.size === 0) return true;
        const firstSelectedId = Array.from(selectedIds)[0];
        const firstSelectedCobranca = cobrancas.find(c => c.id === firstSelectedId);
        return firstSelectedCobranca?.assinatura.participante.nome === participantName;
    };

    if (cobrancas.length === 0) {
        return (
            <div className="py-8">
                <EmptyState
                    icon={searchTerm || statusFilter !== 'all' ? Search : DollarSign}
                    title={searchTerm || statusFilter !== 'all' ? "Nenhuma cobrança" : "Tudo limpo!"}
                    description="Nenhuma cobrança corresponde aos critérios atuais."
                />
            </div>
        );
    }

    return (
        <div className={cn(
            "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden",
            isCompact && "rounded-xl shadow-none border-gray-100/50"
        )}>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="hover:bg-transparent border-b border-gray-100">
                            {!isCompact && (
                                <TableHead className="text-[10px] font-black text-gray-500 uppercase tracking-wider min-w-[160px]">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            checked={allSelected ? true : someSelected ? "indeterminate" : false}
                                            onCheckedChange={handleSelectAll}
                                            className="bg-white"
                                        />
                                        <User size={12} className="text-gray-400" />
                                        Participante
                                    </div>
                                </TableHead>
                            )}

                            {isCompact && (
                                <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider px-4 min-w-[120px]">
                                    <div className="flex items-center justify-center gap-2">
                                        <History size={12} className="text-gray-400" />
                                        Período
                                    </div>
                                </TableHead>
                            )}

                            {!isCompact && (
                                <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                    <div className="flex items-center justify-center gap-2">
                                        <TrendingUp size={12} className="text-gray-400" />
                                        Emissão
                                    </div>
                                </TableHead>
                            )}

                            <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider px-4 min-w-[110px]">
                                <div className="flex items-center justify-center gap-2">
                                    <Calendar size={12} className="text-gray-400" />
                                    Vencimento
                                </div>
                            </TableHead>

                            <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                Status
                            </TableHead>

                            {!isCompact && (
                                <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                    Pagamento
                                </TableHead>
                            )}

                            <TableHead className="text-right text-[10px] font-black text-gray-500 uppercase tracking-wider px-4 min-w-[100px]">
                                <div className="flex items-center justify-end gap-2">
                                    <DollarSign size={12} className="text-gray-400" />
                                    Valor
                                </div>
                            </TableHead>

                            {!isCompact && (
                                <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                    Transação
                                </TableHead>
                            )}

                            <TableHead className="w-[50px] text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">#</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {groupedCobrancas ? (
                            <>
                                {participantNames.map((pName) => {
                                    const participantCobrancas = groupedCobrancas[pName];
                                    const selectableInGroup = participantCobrancas.filter((c: any) => ['pendente', 'atrasado'].includes(c.status));
                                    const allInGroupSelected = selectableInGroup.length > 0 && selectedIds && selectableInGroup.every((c: any) => selectedIds.has(c.id));
                                    const someInGroupSelected = selectableInGroup.length > 0 && selectedIds && !allInGroupSelected && selectableInGroup.some((c: any) => selectedIds.has(c.id));
                                    const isGroupDisabled = !canSelectGroup(pName);

                                    return (
                                        <Fragment key={pName}>
                                            <CobrancaGroupHeader
                                                participantName={pName}
                                                itemCount={participantCobrancas.length}
                                                isSelected={allInGroupSelected ? true : someInGroupSelected ? "indeterminate" : false}
                                                isCompact={isCompact}
                                                isDisabled={selectableInGroup.length === 0}
                                                showWarning={isGroupDisabled && selectableInGroup.length > 0}
                                                isExpanded={!collapsedGroups[pName]}
                                                onToggleExpand={() => toggleGroup(pName)}
                                                onSelectChange={(checked) => {
                                                    if (!onSelectAll) return;
                                                    if (!checked) {
                                                        const groupIds = participantCobrancas.map((c: any) => c.id);
                                                        const nextIds = new Set(selectedIds);
                                                        groupIds.forEach((id: number) => nextIds.delete(id));
                                                        onSelectAll(Array.from(nextIds));
                                                    } else {
                                                        if (canSelectGroup(pName)) {
                                                            const existingIds = selectedIds ? Array.from(selectedIds) : [];
                                                            const groupIds = selectableInGroup.map((c: any) => c.id);
                                                            onSelectAll([...existingIds, ...groupIds]);
                                                        } else {
                                                            onSelectAll(selectableInGroup.map((c: any) => c.id));
                                                        }
                                                    }
                                                }}
                                            />
                                            <AnimatePresence initial={false}>
                                                {!collapsedGroups[pName] && participantCobrancas.map((cobranca: any) => (
                                                    <CobrancaSelectableRow
                                                        key={cobranca.id}
                                                        cobranca={cobranca}
                                                        isSelected={selectedIds?.has(cobranca.id) || false}
                                                        isDisabled={isGroupDisabled && ['pendente', 'atrasado'].includes(cobranca.status)}
                                                        formatDate={formatDate}
                                                        onToggle={() => onToggleSelect?.(cobranca.id)}
                                                        options={getAvailableCobrancaActions(cobranca, {
                                                            isAdmin,
                                                            onDetails: onViewDetails,
                                                            onQrCode: onViewQrCode,
                                                            onConfirm: onConfirmPayment,
                                                            onWhatsApp: onSendWhatsApp,
                                                            onCancel: onCancelPayment
                                                        })}
                                                    />
                                                ))}
                                            </AnimatePresence>
                                        </Fragment>
                                    );
                                })}
                                {individualCobrancas.map((cobranca: any) => (
                                    <CobrancaSelectableRow
                                        key={cobranca.id}
                                        cobranca={cobranca}
                                        isSelected={selectedIds?.has(cobranca.id) || false}
                                        isDisabled={false}
                                        formatDate={formatDate}
                                        onToggle={() => onToggleSelect?.(cobranca.id)}
                                        options={getAvailableCobrancaActions(cobranca, {
                                            isAdmin,
                                            onDetails: onViewDetails,
                                            onQrCode: onViewQrCode,
                                            onConfirm: onConfirmPayment,
                                            onWhatsApp: onSendWhatsApp,
                                            onCancel: onCancelPayment
                                        })}
                                    />
                                ))}
                            </>
                        ) : (
                            cobrancas.slice(0, isCompact ? 5 : undefined).map((cobranca, index) => (
                                <CobrancaRow
                                    key={cobranca.id}
                                    cobranca={cobranca}
                                    index={index}
                                    isCompact={isCompact}
                                    selectedIds={selectedIds}
                                    onToggleSelect={onToggleSelect}
                                    options={getAvailableCobrancaActions(cobranca, {
                                        isAdmin,
                                        onDetails: onViewDetails,
                                        onQrCode: onViewQrCode,
                                        onConfirm: onConfirmPayment,
                                        onWhatsApp: onSendWhatsApp,
                                        onCancel: onCancelPayment
                                    })}
                                    formatDate={formatDate}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
