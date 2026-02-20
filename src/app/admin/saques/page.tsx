import { Metadata } from "next";
import { listarSaquesPendentes } from "@/actions/admin/saques";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { AlertCircle } from "lucide-react";
import { SaquesAdminClient } from "./components/SaquesAdminClient";

export const metadata: Metadata = {
    title: "Saques Pendentes - Admin StreamShare",
};

export default async function AdminSaquesPage() {
    const response = await listarSaquesPendentes();

    if (!response.success || !response.data) {
        return (
            <PageContainer>
                <PageHeader title="Gestão de Saques" description="Aprovação e reijeição de saques solicitados via PIX." />
                <div className="mt-8 p-6 bg-red-50 text-red-600 rounded-xl flex items-center gap-3">
                    <AlertCircle size={24} />
                    <p>{response.error || "Erro ao carregar saques pendentes."}</p>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader
                title="Saques Pendentes"
                description="Analise, aprove (enviando PIX pelo Mercado Pago) ou rejeite as solicitações de saque dos administradores de grupos."
            />
            <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <SaquesAdminClient initialSaques={response.data as any} />
            </div>
        </PageContainer>
    );
}
