import { Metadata } from "next";
import { getWalletData } from "@/actions/wallet";
import { FaturamentoClient } from "./components/FaturamentoClient";
import { FaturamentoError } from "./components/FaturamentoError";

export const metadata: Metadata = {
    title: "Faturamento e Saques - StreamShare",
    description: "Gestão do seu saldo e recebimentos",
};

export default async function FaturamentoPage() {
    const response = await getWalletData();

    if (!response.success || !response.data) {
        return <FaturamentoError error={response.error} />;
    }

    return <FaturamentoClient initialData={response.data} />;
}
