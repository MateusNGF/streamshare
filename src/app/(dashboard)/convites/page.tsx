import { getMyInvites } from "@/actions/invites";
import { UserInvitesList } from "@/components/invites/UserInvitesList";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function InvitesPage() {
    const invites = await getMyInvites();

    return (
        <PageContainer>
            <PageHeader
                title="Meus Convites"
                description="Veja os convites que você recebeu para participar de grupos."
            />
            <UserInvitesList initialInvites={invites} />
        </PageContainer>
    );
}
