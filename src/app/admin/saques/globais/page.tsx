import { Metadata } from "next";
import { listarTodosSaques } from "@/actions/admin/saques";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { AlertCircle } from "lucide-react";
import { SaquesGlobalClient } from "./SaquesGlobalClient";

export const metadata: Metadata = {
    title: "Saques Globais - Admin StreamShare",
};

export default async function AdminSaquesGlobaisPage() {
    const response = await listarTodosSaques();

    if (!response.success || !response.data) {
        return (
            <PageContainer>
                <PageHeader title="Histórico de Saques" description="Visão geral de todas as solicitações de saque realizadas no sistema." />
                <div className="mt-8 p-6 bg-red-50 text-red-600 rounded-xl flex items-center gap-3">
                    <AlertCircle size={24} />
                    <p>{response.error || "Erro ao carregar histórico de saques."}</p>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader
                title="Saques Globais"
                description="Acompanhe o histórico completo de saques aprovados, pendentes e cancelados de todos os provedores."
            />
            <div className="mt-8">
                <SaquesGlobalClient initialSaques={response.data as any} />
            </div>
        </PageContainer>
    );
}
