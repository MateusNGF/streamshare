"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import { User, Calendar, DollarSign, Eye, Clock, Hash, Check, MessageCircle, Trash, Lock, CheckCircle } from "lucide-react";

import { Checkbox } from "@/components/ui/Checkbox";
import { StreamingLogo } from "@/components/ui/StreamingLogo";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Dropdown } from "@/components/ui/Dropdown";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import { BillingValueCell, BillingDueDateCell, BillingPeriodCell } from "@/components/cobrancas/shared/BillingTableCells";
import { useToast } from "@/hooks/useToast";
import React, { useState, useMemo, Fragment, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ModalPagamentoCobranca } from "./ModalPagamentoCobranca";
import { CobrancaGroupHeader } from "@/components/cobrancas/items/CobrancaGroupHeader";
import { FaturaTableRow } from "./items/FaturaTableRow";

interface FaturasTableProps {
    faturas: any[];
    onViewDetails: (id: number) => void;
    isAdmin?: boolean;
    onConfirmPayment?: (id: number) => void;
    onSendWhatsApp?: (id: number) => void;
    onCancelPayment?: (id: number) => void;
    selectedIds?: number[];
    onSelectChange?: (ids: number[]) => void;
}

export function FaturasTable({
    faturas,
    onViewDetails,
    isAdmin = false,
    onConfirmPayment,
    onSendWhatsApp,
    onCancelPayment,
    selectedIds = [],
    onSelectChange
}: FaturasTableProps) {

    // The table manages its own payment modal for direct pay actions
    const [faturaToPayOrResend, setFaturaToPayOrResend] = useState<any>(null);

    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    const toggleGroup = (organizer: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [organizer]: prev[organizer] === undefined ? false : !prev[organizer]
        }));
    };

    const selectableFaturas = faturas.filter(f => !f.lotePagamentoId && (f.status === 'pendente' || f.status === 'atrasado'));
    const isAllSelected = selectableFaturas.length > 0 && selectedIds.length === selectableFaturas.length;

    const handleSelectAll = (checked: boolean) => {
        if (!onSelectChange) return;
        if (!checked) {
            onSelectChange([]);
        } else {
            onSelectChange(selectableFaturas.map(f => f.id));
        }
    };


    if (faturas.length === 0) {
        return (
            <div className="py-8">
                <EmptyState
                    icon={CheckCircle}
                    title="Tudo em dia! 🎉"
                    description="Suas assinaturas estão garantidas. Nenhuma fatura pendente ou atrasada."
                    className="bg-green-50/20 border-green-100"
                />
            </div>
        );
    }

    // Grouping Logic - Only group 'pendente' and 'atrasado'
    const groupedData = useMemo(() => {
        if (isAdmin) return { groups: null, individual: faturas };

        const groups: Record<string, any[]> = {};
        const individual: any[] = [];

        faturas.forEach(f => {
            const isGroupable = f.status === 'pendente' || f.status === 'atrasado';
            if (isGroupable) {
                const organizerName = f.assinatura.participante.conta.nome || "Outros";
                if (!groups[organizerName]) groups[organizerName] = [];
                groups[organizerName].push(f);
            } else {
                individual.push(f);
            }
        });

        return { groups, individual };
    }, [faturas, isAdmin]);

    const groupedFaturas = groupedData.groups;
    const individualFaturas = groupedData.individual;

    // Check if multiple organizers are selected
    const selectedOrganizers = useMemo(() => {
        const organizers = new Set<string>();
        selectedIds.forEach(id => {
            const fatura = faturas.find(f => f.id === id);
            if (fatura) {
                organizers.add(fatura.assinatura.participante.conta.nome);
            }
        });
        return Array.from(organizers);
    }, [selectedIds, faturas]);

    const hasMixedOrganizers = selectedOrganizers.length > 1;
    const currentOrganizer = selectedOrganizers.length === 1 ? selectedOrganizers[0] : null;

    const handleSelectRow = (fatura: any) => {
        if (!onSelectChange) return;

        const isSelected = selectedIds.includes(fatura.id);
        const organizerName = fatura.assinatura.participante.conta.nome;

        if (isSelected) {
            onSelectChange(selectedIds.filter(id => id !== fatura.id));
        } else {
            // If already selecting from another organizer, clear and select new one
            // OR just add if it's the same organizer
            if (currentOrganizer && currentOrganizer !== organizerName) {
                onSelectChange([fatura.id]);
            } else {
                onSelectChange([...selectedIds, fatura.id]);
            }
        }
    };

    const handleSelectGroup = (organizerName: string, groupFaturas: any[]) => {
        if (!onSelectChange) return;

        const selectableInGroup = groupFaturas.filter(f => !f.lotePagamentoId && (f.status === 'pendente' || f.status === 'atrasado'));
        const groupIds = selectableInGroup.map(f => f.id);
        const allGroupSelected = groupIds.every(id => selectedIds.includes(id));

        if (allGroupSelected) {
            onSelectChange(selectedIds.filter(id => !groupIds.includes(id)));
        } else {
            // Switch to this organizer's group
            onSelectChange(groupIds);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="hover:bg-transparent border-b border-gray-100">
                            {!isAdmin && onSelectChange && (
                                <TableHead className="w-[40px] px-4 text-center">
                                    <Checkbox
                                        checked={isAllSelected}
                                        onCheckedChange={handleSelectAll}
                                        className="bg-white"
                                    />
                                </TableHead>
                            )}
                            <TableHead className="text-[10px] font-black text-gray-500 uppercase tracking-wider min-w-[140px]">
                                <div className="flex items-center gap-2">
                                    <Hash size={12} className="text-gray-400" />
                                    Serviço
                                </div>
                            </TableHead>

                            <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider px-4 min-w-[120px]">
                                <div className="flex items-center justify-center gap-2">
                                    <Clock size={12} className="text-gray-400" />
                                    Período
                                </div>
                            </TableHead>

                            <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider px-4 min-w-[110px]">
                                <div className="flex items-center justify-center gap-2">
                                    <Calendar size={12} className="text-gray-400" />
                                    Vencimento
                                </div>
                            </TableHead>

                            <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                Status
                            </TableHead>

                            <TableHead className="text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center justify-center gap-2">
                                    <User size={12} className="text-gray-400" />
                                    Responsável
                                </div>
                            </TableHead>

                            <TableHead className="text-right text-[10px] font-black text-gray-500 uppercase tracking-wider px-4 min-w-[100px]">
                                <div className="flex items-center justify-end gap-2">
                                    <DollarSign size={12} className="text-gray-400" />
                                    Valor
                                </div>
                            </TableHead>

                            <TableHead className="w-[50px] text-center text-[10px] font-black text-gray-500 uppercase tracking-wider">#</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {groupedFaturas ? (
                            <>
                                {Object.entries(groupedFaturas).map(([organizerName, groupFaturas]) => {
                                    const selectableInGroup = groupFaturas.filter(f => !f.lotePagamentoId && (f.status === 'pendente' || f.status === 'atrasado'));
                                    const groupIds = selectableInGroup.map(f => f.id);
                                    const isGroupSelected = groupIds.length > 0 && groupIds.every(id => selectedIds.includes(id));
                                    const isGroupIndeterminate = groupIds.some(id => selectedIds.includes(id)) && !isGroupSelected;

                                    return (
                                        <Fragment key={`group-${organizerName}`}>
                                            <CobrancaGroupHeader
                                                participantName={organizerName}
                                                itemCount={groupFaturas.length}
                                                isSelected={isGroupSelected ? true : isGroupIndeterminate ? "indeterminate" : false}
                                                onSelectChange={() => handleSelectGroup(organizerName, groupFaturas)}
                                                isDisabled={false}
                                                showWarning={hasMixedOrganizers && currentOrganizer !== organizerName}
                                                isExpanded={expandedGroups[organizerName] !== false}
                                                onToggleExpand={() => toggleGroup(organizerName)}
                                            />
                                            <AnimatePresence initial={false}>
                                                {expandedGroups[organizerName] !== false && groupFaturas.map((fatura, idx) => (
                                                    <FaturaTableRow
                                                        key={fatura.id}
                                                        fatura={fatura}
                                                        index={idx}
                                                        isAdmin={isAdmin}
                                                        onViewDetails={onViewDetails}
                                                        onConfirmPayment={onConfirmPayment}
                                                        onSendWhatsApp={onSendWhatsApp}
                                                        onCancelPayment={onCancelPayment}
                                                        selectedIds={selectedIds}
                                                        handleSelect={() => handleSelectRow(fatura)}
                                                        isDisabled={currentOrganizer !== null && currentOrganizer !== fatura.assinatura.participante.conta.nome}
                                                        setFaturaToPayOrResend={setFaturaToPayOrResend}
                                                    />
                                                ))}
                                            </AnimatePresence>
                                        </Fragment>
                                    );
                                })}
                                {individualFaturas.map((fatura, idx) => (
                                    <FaturaTableRow
                                        key={fatura.id}
                                        fatura={fatura}
                                        index={idx}
                                        isAdmin={isAdmin}
                                        onViewDetails={onViewDetails}
                                        onConfirmPayment={onConfirmPayment}
                                        onSendWhatsApp={onSendWhatsApp}
                                        onCancelPayment={onCancelPayment}
                                        selectedIds={selectedIds}
                                        handleSelect={() => handleSelectRow(fatura)}
                                        setFaturaToPayOrResend={setFaturaToPayOrResend}
                                    />
                                ))}
                            </>
                        ) : (
                            faturas.map((fatura: any, index: number) => (
                                <FaturaTableRow
                                    key={fatura.id}
                                    fatura={fatura}
                                    index={index}
                                    isAdmin={isAdmin}
                                    onViewDetails={onViewDetails}
                                    onConfirmPayment={onConfirmPayment}
                                    onSendWhatsApp={onSendWhatsApp}
                                    onCancelPayment={onCancelPayment}
                                    selectedIds={selectedIds}
                                    handleSelect={() => handleSelectRow(fatura)}
                                    setFaturaToPayOrResend={setFaturaToPayOrResend}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <ModalPagamentoCobranca
                isOpen={!!faturaToPayOrResend}
                onClose={() => setFaturaToPayOrResend(null)}
                fatura={faturaToPayOrResend}
                isAdmin={isAdmin}
            />
        </div>
    );
}
