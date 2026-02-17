import { Suspense } from "react";
import { getUsers } from "@/actions/admin/users";
import { UsersClient } from "@/components/admin/users/UsersClient";
import { LoadingPage } from "@/components/ui/LoadingPage";

export const metadata = {
    title: "Gerenciar Usuários | StreamShare Admin",
};

export default async function UsersPage({
    searchParams,
}: {
    searchParams: { page?: string; q?: string };
}) {
    const page = Number(searchParams.page) || 1;
    const search = searchParams.q || "";

    const result = await getUsers(page, 10, search);

    if (!result.success || !result.data) {
        return (
            <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl border border-red-100">
                {result.error || "Erro ao carregar usuários"}
            </div>
        );
    }

    const { data, metadata } = result.data;

    return (
        <Suspense
            key={page + search}
            fallback={<LoadingPage />}
        >
            <UsersClient users={data} metadata={metadata} />
        </Suspense>
    );
}
