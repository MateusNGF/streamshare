import { getCurrentUser } from "@/lib/auth";
import { StatusPageClient } from "@/components/status/StatusPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Status & Changelog | StreamShare",
    description: "Acompanhe a disponibilidade dos nossos serviços e as últimas atualizações do StreamShare.",
};

export default async function StatusPage() {
    const session = await getCurrentUser();

    return <StatusPageClient session={session} />;
}
