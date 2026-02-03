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

    const { data, metadata } = await getUsers(page, 10, search);

    return (
        <Suspense
            key={page + search}
            fallback={<LoadingPage />}
        >
            <UsersClient users={data} metadata={metadata} />
        </Suspense>
    );
}
