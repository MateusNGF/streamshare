import { useMemo } from "react";

interface SelectionConfig {
    faturas: any[];
    selectedIds: number[];
    onSelectChange?: (ids: number[]) => void;
}

export function useFaturasTableSelection({ faturas, selectedIds, onSelectChange }: SelectionConfig) {
    const selectableFaturas = useMemo(() =>
        faturas.filter(f => !f.lotePagamentoId && (f.status === 'pendente' || f.status === 'atrasado')),
        [faturas]
    );

    const isAllSelected = selectableFaturas.length > 0 && selectedIds.length === selectableFaturas.length;
    const isSomeSelected = selectableFaturas.length > 0 && !isAllSelected && selectableFaturas.some(f => selectedIds.includes(f.id));

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

    const currentOrganizer = selectedOrganizers.length === 1 ? selectedOrganizers[0] : null;

    const handleSelectAll = (checked: boolean) => {
        if (!onSelectChange) return;
        if (!checked) {
            onSelectChange([]);
        } else {
            if (currentOrganizer) {
                const groupFaturas = selectableFaturas.filter(f => f.assinatura.participante.conta.nome === currentOrganizer);
                onSelectChange(groupFaturas.map(f => f.id));
            } else {
                onSelectChange(selectableFaturas.map(f => f.id));
            }
        }
    };

    const handleSelectRow = (fatura: any) => {
        if (!onSelectChange) return;

        const isSelected = selectedIds.includes(fatura.id);
        const organizerName = fatura.assinatura.participante.conta.nome;

        if (isSelected) {
            onSelectChange(selectedIds.filter(id => id !== fatura.id));
        } else {
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
            if (currentOrganizer && currentOrganizer !== organizerName) {
                onSelectChange(groupIds);
            } else {
                const otherSelectedIds = selectedIds.filter(id => !groupIds.includes(id));
                onSelectChange([...otherSelectedIds, ...groupIds]);
            }
        }
    };

    const getIsDisabled = (fatura: any) => {
        if (!onSelectChange) return true;
        if (fatura.lotePagamentoId) return true;
        if (fatura.status !== 'pendente' && fatura.status !== 'atrasado') return true;

        // Disable if another organizer is already selected
        const organizerName = fatura.assinatura?.participante?.conta?.nome;
        return currentOrganizer !== null && currentOrganizer !== organizerName;
    };

    const getIsGroupDisabled = (organizerName: string, groupFaturas: any[]) => {
        if (!onSelectChange) return true;
        const selectableInGroup = groupFaturas.filter(f => !f.lotePagamentoId && (f.status === 'pendente' || f.status === 'atrasado'));
        if (selectableInGroup.length === 0) return true;

        return currentOrganizer !== null && currentOrganizer !== organizerName;
    };

    return {
        selectableFaturas,
        isAllSelected,
        isSomeSelected,
        currentOrganizer,
        handleSelectAll,
        handleSelectRow,
        handleSelectGroup,
        getIsDisabled,
        getIsGroupDisabled
    };
}
