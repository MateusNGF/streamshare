import { getSettingsData } from "@/actions/settings";
import { SettingsClient } from "@/components/configuracoes/SettingsClient";

export default async function ConfiguracoesPage() {
    const data = await getSettingsData();

    return <SettingsClient initialData={data} />;
}
