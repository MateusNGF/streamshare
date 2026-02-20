"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AdminUser } from "@/actions/admin/users";
import { ChevronLeft, ChevronRight, Search, Users, Mail, Calendar, Shield } from "lucide-react";
import { GenericFilter, FilterConfig } from "@/components/ui/GenericFilter";
import { SectionHeader } from "@/components/layout/SectionHeader";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { useDebouncedCallback } from "use-debounce";
import { UserRow } from "./UserRow";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

interface UsersClientProps {
    users: AdminUser[];
    metadata: {
        total: number;
        page: number;
        perPage: number;
        totalPages: number;
    };
}

export function UsersClient({ users, metadata }: UsersClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set("q", term);
        } else {
            params.delete("q");
        }
        params.set("page", "1");
        router.replace(`${pathname}?${params.toString()}`);
    }, 300);

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", newPage.toString());
        router.replace(`${pathname}?${params.toString()}`);
    };


    const filters: FilterConfig[] = [
        {
            key: "q",
            type: "text",
            placeholder: "Buscar por nome ou email...",
            className: "w-full"
        }
    ];

    const handleFilterChange = (key: string, value: string) => {
        if (key === "q") {
            handleSearch(value);
        }
    };

    return (
        <PageContainer>
            <PageHeader
                title="Gerenciar Usuários"
                description="Visualize e gerencie as permissões dos usuários do sistema"
            />

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 md:mb-8">
                <GenericFilter
                    filters={filters}
                    values={{ q: searchParams.get("q")?.toString() || "" }}
                    onChange={handleFilterChange}
                    className="w-full"
                />
            </div>

            <SectionHeader
                title="Lista de Usuários"
                description={`${metadata.total} usuários cadastrados`}
            />

            {users.length === 0 ? (
                <EmptyState
                    icon={Search}
                    title="Nenhum usuário encontrado"
                    description={
                        searchParams.get("q")
                            ? `Não encontramos resultados para "${searchParams.get("q")}". Tente outro termo.`
                            : "Não há usuários cadastrados no sistema."
                    }
                />
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow className="hover:bg-transparent border-b border-gray-100">
                                    <TableHead className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <Users size={12} className="text-gray-400" />
                                            Usuário
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <Mail size={12} className="text-gray-400" />
                                            Email
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={12} className="text-gray-400" />
                                            Cadastro
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <Shield size={12} className="text-gray-400" />
                                            Função
                                        </div>
                                    </TableHead>
                                    <TableHead className="w-[80px] text-right text-[10px] font-black text-gray-500 uppercase tracking-wider">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <UserRow key={user.id} user={user} />
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-gray-50 gap-4">
                        <div className="text-xs font-medium text-gray-500 order-2 sm:order-1">
                            Mostrando <span className="text-gray-900">{((metadata.page - 1) * metadata.perPage) + 1}</span> a <span className="text-gray-900">{Math.min(metadata.page * metadata.perPage, metadata.total)}</span> de <span className="text-gray-900">{metadata.total}</span> resultados
                        </div>
                        <div className="flex gap-2 order-1 sm:order-2 w-full sm:w-auto">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(metadata.page - 1)}
                                disabled={metadata.page <= 1}
                                className="flex-1 sm:flex-none gap-2 rounded-xl text-xs font-bold"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(metadata.page + 1)}
                                disabled={metadata.page >= metadata.totalPages}
                                className="flex-1 sm:flex-none gap-2 rounded-xl text-xs font-bold"
                            >
                                Próxima
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </PageContainer>
    );
}
