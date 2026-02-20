import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { SUPPORTED_CURRENCIES, CurrencyCode } from "@/types/currency.types";

interface CurrencySelectProps {
    value: CurrencyCode | string;
    onValueChange: (value: CurrencyCode | string) => void;
    disabled?: boolean;
    className?: string;
    label?: string;
}

export function CurrencySelect({ value, onValueChange, disabled, className = "", label = "Moeda Padrão" }: CurrencySelectProps) {
    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                </label>
            )}
            <Select value={value || 'BRL'} onValueChange={onValueChange} disabled={disabled}>
                <SelectTrigger className="w-full h-12 rounded-xl border border-gray-200 bg-white hover:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all px-4">
                    <div className="flex items-center gap-3">
                        {value && SUPPORTED_CURRENCIES[value as CurrencyCode] ? (
                            <>
                                <div className="font-medium text-gray-900">
                                    {SUPPORTED_CURRENCIES[value as CurrencyCode].name} ({SUPPORTED_CURRENCIES[value as CurrencyCode].code})
                                </div>
                            </>
                        ) : (
                            <SelectValue placeholder="Selecione a moeda" />
                        )}
                    </div>
                </SelectTrigger>
                <SelectContent className="bg-white border rounded-xl shadow-lg">
                    {Object.entries(SUPPORTED_CURRENCIES).map(([code, info]) => (
                        <SelectItem key={code} value={code} className="rounded-lg py-2 cursor-pointer focus:bg-primary/5">
                            <div className="flex items-center gap-3">
                                <span className="text-base w-6 text-center">{info.symbol}</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {info.name} ({info.code})
                                </span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
