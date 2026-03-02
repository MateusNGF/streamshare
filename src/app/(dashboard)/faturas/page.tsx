import { getFaturasUsuario, getResumoFaturas } from "@/actions/faturas";
import { getLotesUsuario } from "@/actions/cobrancas";
import { FaturasClient } from "./FaturasClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Minhas Faturas | StreamShare",
    description: "Gerencie suas faturas e pagamentos.",
};

export default async function FaturasPage() {
    const [faturas, resumo, lotes] = await Promise.all([
        getFaturasUsuario(),
        getResumoFaturas(),
        getLotesUsuario()
    ]);

    const error = (!faturas.success || !resumo.success || !lotes.success) ? "Falha ao carregar algumas informações de faturas." : undefined;

    return (
        <FaturasClient
            faturas={faturas.data || []}
            resumo={resumo.data || {}}
            lotes={lotes.data || []}
            error={error}
        />
    );
}
