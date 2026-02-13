import { getPendingRequests } from "@/actions/requests";
import { AdminRequestsList } from "@/components/admin/AdminRequestsList";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { getContext } from "@/lib/action-context";

export default async function RequestsPage() {
    const { nivelAcesso } = await getContext();

    // Only admins/owners see this
    if (nivelAcesso !== 'admin' && nivelAcesso !== 'owner') {
        return (
            <PageContainer>
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                    Acesso negado.
                </div>
            </PageContainer>
        );
    }

    const requests = await getPendingRequests();

    return (
        <PageContainer>
            <PageHeader
                title="Solicitações de Entrada"
                description="Gerencie solicitações de usuários que desejam entrar no grupo."
            />
            <AdminRequestsList initialRequests={requests} />
        </PageContainer>
    );
}
