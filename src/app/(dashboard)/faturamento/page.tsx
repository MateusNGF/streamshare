import { Metadata } from "next";
import { getWalletData } from "@/actions/wallet";
import { FaturamentoClient } from "./components/FaturamentoClient";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Faturamento e Saques - StreamShare",
    description: "Gestão do seu saldo e recebimentos",
};

export default async function FaturamentoPage() {
    const response = await getWalletData();

    if (!response.success || !response.data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <h1 className="text-xl font-bold text-red-600">Erro ao carregar dados da carteira</h1>
                <p className="text-gray-500">{response.error || "Tente novamente mais tarde."}</p>
            </div>
        );
    }

    return <FaturamentoClient initialData={response.data} />;
}
