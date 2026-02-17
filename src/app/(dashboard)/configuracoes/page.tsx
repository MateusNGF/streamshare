import { getSettingsData } from "@/actions/settings";
import { SettingsClient } from "@/components/configuracoes/SettingsClient";

export default async function ConfiguracoesPage() {
    const response = await getSettingsData();

    if (!response.success || !response.data) {
        // You might want to redirect to an error page or show a generic error
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <h1 className="text-xl font-bold text-red-600">Erro ao carregar configurações</h1>
                <p className="text-gray-500">{response.error || "Tente novamente mais tarde."}</p>
            </div>
        );
    }

    return <SettingsClient initialData={response.data} />;
}
