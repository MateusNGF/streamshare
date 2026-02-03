"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AdminUser } from "@/actions/admin/users";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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

    return (
        <PageContainer>
            <PageHeader
                title="Gerenciar Usuários"
                description="Visualize e gerencie as permissões dos usuários do sistema"
            />

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 md:mb-8">
                <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
                    <Search size={20} className="text-gray-400 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou email..."
                        defaultValue={searchParams.get("q")?.toString()}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-500 min-w-0"
                    />
                </div>
            </div>

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
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Usuário</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Data Cadastro</TableHead>
                                <TableHead>Função</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <UserRow key={user.id} user={user} />
                            ))}
                        </TableBody>
                    </Table>

                    <div className="flex items-center justify-between p-4 border-t border-gray-100">
                        <div className="text-sm text-gray-500">
                            Mostrando {((metadata.page - 1) * metadata.perPage) + 1} a {Math.min(metadata.page * metadata.perPage, metadata.total)} de {metadata.total} resultados
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(metadata.page - 1)}
                                disabled={metadata.page <= 1}
                                className="gap-2 rounded-xl"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(metadata.page + 1)}
                                disabled={metadata.page >= metadata.totalPages}
                                className="gap-2 rounded-xl"
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
