import { Input } from "@/components/ui/Input";
import { TestTube, Eye, EyeOff } from "lucide-react";
import { SectionHeader } from "@/components/layout/SectionHeader";

interface WhatsappTabProps {
    config: {
        accountSid: string;
        authToken: string;
        phoneNumber: string;
        enabled: boolean;
    };
    onChange: (config: any) => void;
    showPassword: boolean;
    onTogglePassword: () => void;
    onTest: () => void;
    testing: boolean;
}

export function WhatsappTab({
    config,
    onChange,
    showPassword,
    onTogglePassword,
    onTest,
    testing
}: WhatsappTabProps) {
    return (
        <div className="animate-in fade-in duration-300 space-y-6">
            <SectionHeader
                title="Configurações WhatsApp"
                description="Integração com Twilio para envio de mensagens automáticas"
                rightElement={
                    <button
                        onClick={onTest}
                        disabled={testing}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 hover:border-primary/30 hover:shadow-sm transition-all disabled:opacity-50 text-sm"
                    >
                        <TestTube size={18} className="text-primary" />
                        {testing ? "Testando..." : "Testar Conexão"}
                    </button>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    label="Account SID"
                    value={config.accountSid}
                    onChange={(e) => onChange({ ...config, accountSid: e.target.value })}
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                />
                <div className="relative">
                    <Input
                        label="Auth Token"
                        type={showPassword ? "text" : "password"}
                        value={config.authToken}
                        onChange={(e) => onChange({ ...config, authToken: e.target.value })}
                        placeholder="••••••••••••••••••••••••••••••••"
                    />
                    <button
                        type="button"
                        onClick={onTogglePassword}
                        className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                <Input
                    label="Número de Telefone"
                    value={config.phoneNumber}
                    onChange={(e) => onChange({ ...config, phoneNumber: e.target.value })}
                    placeholder="+5511999999999"
                />
            </div>

            <div className="mt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={config.enabled}
                        onChange={(e) => onChange({ ...config, enabled: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="font-medium text-gray-700">Habilitar integração WhatsApp</span>
                </label>
            </div>
        </div>
    );
}
