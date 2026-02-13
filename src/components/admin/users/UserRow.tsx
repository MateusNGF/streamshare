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
                await toggleAdminRole(user.id);
                if (user.isAdmin) {
                    toast.warning("Admin removido com sucesso");
                } else {
                    toast.success("Admin adicionado com sucesso");
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
        <TableRow>
            <TableCell className="font-medium">{user.nome}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
                {format(new Date(user.createdAt), "dd/MM/yyyy", {
                    locale: ptBR,
                })}
            </TableCell>
            <TableCell>
                {user.isAdmin ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Admin
                    </span>
                ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
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
