"use client";

import { Table, TableBody } from "@/components/ui/Table";
import React, { useState, useMemo, Fragment } from "react";
import { AnimatePresence } from "framer-motion";
import { ModalPagamentoCobranca } from "./ModalPagamentoCobranca";
import { CobrancaGroupHeader } from "@/components/cobrancas/items/CobrancaGroupHeader";
import { FaturaTableRow } from "./items/FaturaTableRow";
import { FaturasTableHeader } from "./items/FaturasTableHeader";
import { FaturasTableEmpty } from "./items/FaturasTableEmpty";
import { useFaturasTableSelection } from "@/hooks/useFaturasTableSelection";

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

export function FaturasTable(props: FaturasTableProps) {
    const {
        faturas,
        onViewDetails,
        isAdmin = false,
        onConfirmPayment,
        onSendWhatsApp,
        onCancelPayment,
        selectedIds = [],
        onSelectChange
    } = props;

    const [faturaToPayOrResend, setFaturaToPayOrResend] = useState<any>(null);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    const selection = useFaturasTableSelection({ faturas, selectedIds, onSelectChange });

    const toggleGroup = (organizer: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [organizer]: prev[organizer] === undefined ? false : !prev[organizer]
        }));
    };

    const groupedData = useMemo(() => {
        if (isAdmin) return { groups: null, individual: faturas };

        const groups: Record<string, any[]> = {};
        const individual: any[] = [];

        faturas.forEach(f => {
            const isGroupable = f.status === 'pendente' || f.status === 'atrasado';
            if (isGroupable) {
                const organizerName = f.assinatura?.participante?.conta?.nome || "Outros";
                if (!groups[organizerName]) groups[organizerName] = [];
                groups[organizerName].push(f);
            } else {
                individual.push(f);
            }
        });

        return { groups, individual };
    }, [faturas, isAdmin]);

    if (faturas.length === 0) return <FaturasTableEmpty />;

    const renderRow = (fatura: any, idx: number) => (
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
            handleSelect={() => selection.handleSelectRow(fatura)}
            isDisabled={selection.getIsDisabled(fatura)}
            setFaturaToPayOrResend={setFaturaToPayOrResend}
        />
    );

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <FaturasTableHeader
                        isAdmin={isAdmin}
                        onSelectChange={onSelectChange}
                        isAllSelected={selection.isAllSelected}
                        isSomeSelected={selection.isSomeSelected}
                        handleSelectAll={selection.handleSelectAll}
                    />
                    <TableBody>
                        {groupedData.groups ? (
                            Object.entries(groupedData.groups).map(([organizerName, groupFaturas]) => {
                                const selectableInGroup = groupFaturas.filter(f => !f.lotePagamentoId && (f.status === 'pendente' || f.status === 'atrasado'));
                                const groupIds = selectableInGroup.map(f => f.id);
                                const isGroupSelected = groupIds.length > 0 && groupIds.every(id => selectedIds.includes(id));
                                const isGroupIndeterminate = groupIds.some(id => selectedIds.includes(id)) && !isGroupSelected;
                                const isExpanded = expandedGroups[organizerName] !== false;

                                return (
                                    <Fragment key={organizerName}>
                                        <CobrancaGroupHeader
                                            participantName={organizerName}
                                            itemCount={groupFaturas.length}
                                            isSelected={isGroupSelected ? true : isGroupIndeterminate ? "indeterminate" : false}
                                            onSelectChange={() => selection.handleSelectGroup(organizerName, groupFaturas)}
                                            isDisabled={selection.getIsGroupDisabled(organizerName, groupFaturas)}
                                            showWarning={selection.currentOrganizer !== null && selection.currentOrganizer !== organizerName}
                                            isExpanded={isExpanded}
                                            onToggleExpand={() => toggleGroup(organizerName)}
                                        />
                                        <AnimatePresence>
                                            {isExpanded && groupFaturas.map((f, idx) => renderRow(f, idx))}
                                        </AnimatePresence>
                                    </Fragment>
                                );
                            })
                        ) : null}

                        {(groupedData.individual || []).map((f, idx) => renderRow(f, idx))}
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
