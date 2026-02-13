import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRY_CODES, CountryCode } from "@/lib/country-codes";

interface CountryCodeSelectProps {
    value: CountryCode;
    onChange: (country: CountryCode) => void;
    disabled?: boolean;
}

export function CountryCodeSelect({ value, onChange, disabled }: CountryCodeSelectProps) {
    const handleValueChange = (code: string) => {
        const country = COUNTRY_CODES.find((c) => c.code === code);
        if (country) {
            onChange(country);
        }
    };

    return (
        <Select value={value.code} onValueChange={handleValueChange} disabled={disabled}>
            <SelectTrigger
                className="w-[110px] gap-2 px-3 h-full border-gray-200 rounded-l-xl rounded-r-none bg-gradient-to-b from-white to-gray-50/50 hover:from-gray-50 hover:to-gray-100/50 focus:ring-0 focus:ring-offset-0 focus:border-gray-200 data-[state=open]:border-primary"
            >
                <div className="flex items-center gap-2">
                    <span className="text-2xl leading-none">{value.flag}</span>
                    <span className="font-semibold text-gray-700 tracking-tight">{value.dialCode}</span>
                </div>
            </SelectTrigger>
            <SelectContent className="max-h-[300px] overflow-y-auto">
                {COUNTRY_CODES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl leading-none">{country.flag}</span>
                            <span className="text-gray-900">{country.name}</span>
                            <span className="text-gray-500 font-mono ml-auto">{country.dialCode}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
