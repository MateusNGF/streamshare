import { Input } from "@/components/ui/Input";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { PercentageInput } from "@/components/ui/PercentageInput";
import { CurrencySelect } from "@/components/ui/CurrencySelect";

interface GeneralTabProps {
    config: {
        appName: string;
        baseUrl: string;
        timezone: string;
        currency: string;
        streamshareFee: string;
    };
    onChange: (config: any) => void;
}

export function GeneralTab({ config, onChange }: GeneralTabProps) {
    return (
        <div className="animate-in fade-in duration-300 space-y-6">
            <SectionHeader
                title="Configurações Gerais"
                description="Parâmetros globais da aplicação e identididade"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Input
                        label="Nome da Aplicação"
                        value={config.appName}
                        onChange={(e) => onChange({ ...config, appName: e.target.value })}
                        placeholder="StreamShare"
                    />
                    <p className="text-xs text-gray-500">O nome que aparece nos cabeçalhos e e-mails.</p>
                </div>

                <div className="space-y-2">
                    <Input
                        label="URL Base"
                        type="url"
                        value={config.baseUrl}
                        onChange={(e) => onChange({ ...config, baseUrl: e.target.value })}
                        placeholder="https://streamshare.com"
                    />
                    <p className="text-xs text-gray-500">Usado para montar links nos convites e faturas.</p>
                </div>

                <div className="space-y-2">
                    <Input
                        label="Timezone"
                        value={config.timezone}
                        onChange={(e) => onChange({ ...config, timezone: e.target.value })}
                        placeholder="America/Sao_Paulo"
                    />
                    <p className="text-xs text-gray-500">Fuso horário padrão para CRON jobs de cobrança.</p>
                </div>

                <div className="space-y-2">
                    <CurrencySelect
                        value={config.currency || 'BRL'}
                        onValueChange={(value) => onChange({ ...config, currency: value })}
                    />
                    <p className="text-xs text-gray-500">Sistema base da plataforma (Ex: BRL).</p>
                </div>

                <div className="space-y-2">
                    <PercentageInput
                        label="Taxa da Plataforma"
                        value={parseFloat(config.streamshareFee) || 0}
                        onValueChange={(val) => onChange({ ...config, streamshareFee: String(val ?? 0) })}
                        placeholder="5.00"
                    />
                    <p className="text-xs text-gray-500">Taxa percentual descontada de cada recebimento via sistema.</p>
                </div>
            </div>
        </div>
    );
}
