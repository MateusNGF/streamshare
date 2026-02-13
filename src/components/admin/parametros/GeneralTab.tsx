import { Input } from "@/components/ui/input";

interface GeneralTabProps {
    config: {
        appName: string;
        baseUrl: string;
        timezone: string;
        currency: string;
    };
    onChange: (config: any) => void;
}

export function GeneralTab({ config, onChange }: GeneralTabProps) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
                <span className="md:hidden">Geral</span>
                <span className="hidden md:inline">Configurações Gerais</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    label="Nome da Aplicação"
                    value={config.appName}
                    onChange={(e) => onChange({ ...config, appName: e.target.value })}
                    placeholder="StreamShare"
                />
                <Input
                    label="URL Base"
                    type="url"
                    value={config.baseUrl}
                    onChange={(e) => onChange({ ...config, baseUrl: e.target.value })}
                    placeholder="https://streamshare.com"
                />
                <Input
                    label="Timezone"
                    value={config.timezone}
                    onChange={(e) => onChange({ ...config, timezone: e.target.value })}
                    placeholder="America/Sao_Paulo"
                />
                <Input
                    label="Moeda Padrão"
                    value={config.currency}
                    onChange={(e) => onChange({ ...config, currency: e.target.value })}
                    placeholder="BRL"
                />
            </div>
        </div>
    );
}
