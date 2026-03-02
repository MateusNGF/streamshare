import { getLotesGestor } from "@/actions/cobrancas";
import { Metadata } from "next";
import { GerenciarLotesClient } from "./GerenciarLotesClient";

export const metadata: Metadata = {
    title: "Gerenciar Lotes | StreamShare",
    description: "Validação de pagamentos em lote.",
};

export default async function GerenciarLotesPage() {
    const response = await getLotesGestor();

    return (
        <GerenciarLotesClient
            initialLotes={response.success ? response.data || [] : []}
        />
    );
}
