"use client";

import { TableCell, TableRow } from "@/components/ui/Table";
import { Checkbox } from "@/components/ui/Checkbox";
import { User, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Fragment } from "react";

interface CobrancaGroupHeaderProps {
    participantName: string;
    itemCount: number;
    isSelected: boolean | "indeterminate";
    onSelectChange: (checked: boolean) => void;
    isDisabled: boolean;
    isCompact?: boolean;
    showWarning?: boolean;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
}

export function CobrancaGroupHeader({
    participantName,
    itemCount,
    isSelected,
    onSelectChange,
    isDisabled,
    isCompact = false,
    showWarning = false,
    isExpanded = true,
    onToggleExpand
}: CobrancaGroupHeaderProps) {
    const handleRowClick = (e: React.MouseEvent) => {
        // Ignora o clique se for no checkbox (que já tem seu próprio handler)
        if ((e.target as HTMLElement).closest('[role="checkbox"]')) return;
        onToggleExpand?.();
    };

    return (
        <TableRow
            className={cn(
                "bg-gray-50/50 border-b border-gray-100 transition-colors",
                onToggleExpand ? "cursor-pointer hover:bg-gray-50/80" : "hover:bg-gray-50/50"
            )}
            onClick={handleRowClick}
        >
            <TableCell colSpan={isCompact ? 6 : 9} >
                <div className="flex items-center justify-between">
                    <div className="flex items-center justify-between gap-3">
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={onSelectChange}
                            disabled={isDisabled}
                        />
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                                <User size={14} className="text-primary" />
                                Pendências de {participantName}
                                <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-[10px]">
                                    {itemCount} {itemCount === 1 ? 'item' : 'itens'}
                                </span>
                            </span>
                        </div>
                        {onToggleExpand && (
                            <div className="px-4 text-gray-400 hover:text-gray-600 transition-colors">
                                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </div>
                        )}
                    </div>

                    {showWarning && (
                        <span className="text-[9px] font-bold text-red-600 bg-red-50 px-3 py-1 mx-5 rounded-md border border-red-200 animate-pulse">
                            Mistura de participantes não permitida.
                        </span>
                    )}
                </div>
            </TableCell>
        </TableRow>
    );
}
