"use client";

import { useTransition } from "react";
import { AdminUser, toggleAdminRole } from "@/actions/admin/users";
import { Dropdown } from "@/components/ui/Dropdown";
import { TableCell, TableRow } from "@/components/ui/Table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Shield, ShieldOff } from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface UserRowProps {
    user: AdminUser;
}

export function UserRow({ user }: UserRowProps) {
    const [isPending, startTransition] = useTransition();
    const toast = useToast();

    const handleToggleAdmin = () => {
        startTransition(async () => {
            try {
                const result = await toggleAdminRole(user.id);
                if (result.success) {
                    if (user.isAdmin) {
                        toast.warning("Admin removido com sucesso");
                    } else {
                        toast.success("Admin adicionado com sucesso");
                    }
                } else if (result.error) {
                    toast.error(result.error);
                }
            } catch (error) {
                toast.error("Erro ao alterar permissão");
            }
        });
    };

    const dropdownOptions = [
        {
            label: user.isAdmin ? "Remover Admin" : "Tornar Admin",
            icon: user.isAdmin ? <ShieldOff size={16} /> : <Shield size={16} />,
            onClick: handleToggleAdmin,
            variant: user.isAdmin ? "danger" as const : "default" as const,
        },
        // Future action: Delete user
        // {
        //   label: "Excluir Usuário",
        //   icon: <Trash2 size={16} />,
        //   onClick: () => toast.error("Funcionalidade não implementada"),
        //   variant: "danger" as const,
        // },
    ];

    return (
        <TableRow className="group animate-in fade-in slide-in-from-left-4 duration-500 fill-mode-both">
            <TableCell>
                <span className="font-bold text-gray-900 leading-tight">
                    {user.nome}
                </span>
            </TableCell>
            <TableCell className="text-sm font-medium text-gray-500">
                {user.email}
            </TableCell>
            <TableCell className="text-xs font-semibold text-gray-400">
                {format(new Date(user.createdAt), "dd/MM/yyyy", {
                    locale: ptBR,
                })}
            </TableCell>
            <TableCell>
                {user.isAdmin ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-700 border border-purple-200 uppercase tracking-tight">
                        Admin
                    </span>
                ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-gray-50 text-gray-500 border border-gray-100 uppercase tracking-tight">
                        Usuário
                    </span>
                )}
            </TableCell>
            <TableCell className="text-right ">
                <Dropdown options={dropdownOptions} />
            </TableCell>
        </TableRow>
    );
}
