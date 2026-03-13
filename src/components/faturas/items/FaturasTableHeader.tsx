"use client";

import { TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Checkbox } from "@/components/ui/Checkbox";
import { User, Calendar, DollarSign, Clock, Hash } from "lucide-react";

interface FaturasTableHeaderProps {
    isAdmin: boolean;
    onSelectChange?: any;
    isAllSelected: boolean;
    isSomeSelected: boolean;
    handleSelectAll: (checked: boolean) => void;
}

export function FaturasTableHeader({
    isAdmin,
    onSelectChange,
    isAllSelected,
    isSomeSelected,
    handleSelectAll
}: FaturasTableHeaderProps) {
    return (
        <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent border-b border-gray-100">

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
    );
}
