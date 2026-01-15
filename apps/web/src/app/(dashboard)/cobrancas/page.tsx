import { getKPIsFinanceiros, getCobrancas } from "@/actions/cobrancas";
import { CobrancasClient } from "./CobrancasClient";

export default async function CobrancasPage() {
    const [kpis, cobrancas] = await Promise.all([
        getKPIsFinanceiros(),
        getCobrancas()
    ]);

    return <CobrancasClient kpis={kpis} cobrancasIniciais={cobrancas} />;
}
