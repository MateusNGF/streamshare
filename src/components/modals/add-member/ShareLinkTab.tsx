"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Globe, Clock, Check, Copy } from "lucide-react";
import { EXPIRATION_OPTIONS } from "./constants";
import { LinkHistoryList } from "./LinkHistoryList";

interface ShareLinkTabProps {
    generatedLink: string;
    expiration: string;
    onExpirationChange: (val: string) => void;
    copied: boolean;
    onCopy: () => void;
    history: any[];
    loadingHistory: boolean;
    onRevoke: (id: string) => void;
    isPending: boolean;
}

export function ShareLinkTab({
    generatedLink,
    expiration,
    onExpirationChange,
    copied,
    onCopy,
    history,
    loadingHistory,
    onRevoke,
    isPending
}: ShareLinkTabProps) {
    if (!generatedLink) {
        return (
            <div className="space-y-6 pt-2">
                <div className="bg-amber-50 p-4 rounded-xl flex gap-3 text-amber-700">
                    <Globe className="shrink-0 mt-0.5" size={20} />
                    <p className="text-sm leading-relaxed">
                        Crie um link de convite rápido. <strong>Atenção:</strong> Qualquer pessoa com este link poderá solicitar entrada.
                    </p>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700 block gap-2 flex items-center">
                        <Clock size={16} className="text-gray-400" />
                        Tempo de Expiração
                    </label>
                    <Select value={expiration} onValueChange={onExpirationChange}>
                        <SelectTrigger className="w-full h-12 rounded-xl border-gray-200 bg-white hover:border-gray-300 transition-all font-medium text-gray-700">
                            <SelectValue placeholder="Selecione o tempo..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                            {EXPIRATION_OPTIONS.map((option: any) => (
                                <SelectItem key={option.value} value={option.value} className="py-3">
                                    <div className="flex flex-col text-left">
                                        <span className="font-medium text-gray-900">{option.label}</span>
                                        <span className="text-xs text-gray-500">{option.description}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <LinkHistoryList
                    history={history}
                    loading={loadingHistory}
                    onRevoke={onRevoke}
                    isPending={isPending}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6 pt-2 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Check size={32} strokeWidth={3} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Link Gerado!</h3>
                <p className="text-sm text-gray-500 max-w-[280px] mx-auto">
                    Link válido por <span className="font-medium text-gray-900">
                        {EXPIRATION_OPTIONS.find((o: any) => o.value === expiration)?.label}
                    </span>.
                </p>
            </div>

            <div className="flex items-center gap-2 p-1 bg-gray-50 border border-gray-100 rounded-xl">
                <div className="flex-1 px-3 text-xs font-mono text-gray-500 truncate">
                    {generatedLink}
                </div>
                <Button
                    size="sm"
                    variant={copied ? "default" : "outline"}
                    onClick={onCopy}
                    className="h-9 px-4"
                >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? "Copiado" : "Copiar"}
                </Button>
            </div>

            <LinkHistoryList
                history={history}
                loading={loadingHistory}
                onRevoke={onRevoke}
                isPending={isPending}
            />
        </div>
    );
}
