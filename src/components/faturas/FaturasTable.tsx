"use client";

import { Table, TableBody } from "@/components/ui/Table";
import React, { useState, useMemo, Fragment } from "react";
import { AnimatePresence } from "framer-motion";
import { ModalPagamentoCobranca } from "./ModalPagamentoCobranca";
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

    const selection = useFaturasTableSelection({ faturas, selectedIds, onSelectChange });





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
                        {faturas.map((f, idx) => renderRow(f, idx))}
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
