import { Input } from "@/components/ui/Input";
import { TestTube, Eye, EyeOff } from "lucide-react";

interface SmtpTabProps {
    config: {
        host: string;
        port: string;
        user: string;
        password: string;
        fromEmail: string;
        fromName: string;
        useTls: boolean;
    };
    onChange: (config: any) => void;
    showPassword: boolean;
    onTogglePassword: () => void;
    onTest: () => void;
    testing: boolean;
}

export function SmtpTab({
    config,
    onChange,
    showPassword,
    onTogglePassword,
    onTest,
    testing
}: SmtpTabProps) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                    <span className="md:hidden">SMTP</span>
                    <span className="hidden md:inline">Configurações de Email (SMTP)</span>
                </h3>
                <button
                    onClick={onTest}
                    disabled={testing}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                    <TestTube size={18} />
                    {testing ? "Testando..." : (
                        <>
                            <span className="md:hidden">Testar</span>
                            <span className="hidden md:inline">Testar Conexão</span>
                        </>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    label="Host SMTP"
                    value={config.host}
                    onChange={(e) => onChange({ ...config, host: e.target.value })}
                    placeholder="smtp.gmail.com"
                />
                <Input
                    label="Porta"
                    type="number"
                    value={config.port}
                    onChange={(e) => onChange({ ...config, port: e.target.value })}
                    placeholder="587"
                />
                <Input
                    label="Usuário"
                    value={config.user}
                    onChange={(e) => onChange({ ...config, user: e.target.value })}
                    placeholder="seu-email@gmail.com"
                />
                <div className="relative">
                    <Input
                        label="Senha"
                        type={showPassword ? "text" : "password"}
                        value={config.password}
                        onChange={(e) => onChange({ ...config, password: e.target.value })}
                        placeholder="••••••••"
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
                    label="Email Remetente"
                    type="email"
                    value={config.fromEmail}
                    onChange={(e) => onChange({ ...config, fromEmail: e.target.value })}
                    placeholder="noreply@streamshare.com"
                />
                <Input
                    label="Nome do Remetente"
                    value={config.fromName}
                    onChange={(e) => onChange({ ...config, fromName: e.target.value })}
                    placeholder="StreamShare"
                />
            </div>

            <div className="mt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={config.useTls}
                        onChange={(e) => onChange({ ...config, useTls: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="font-medium text-gray-700">Usar TLS/SSL</span>
                </label>
            </div>
        </div>
    );
}
