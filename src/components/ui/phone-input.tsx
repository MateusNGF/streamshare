"use client";

import { useState, useEffect } from "react";
import { CountryCodeSelect } from "./country-code-select";
import { MaskedInput } from "./masked-input";
import { getDefaultCountry, extractCountryFromPhone, CountryCode } from "@/lib/country-codes";
import { removeNonNumeric } from "@/lib/validation";

interface PhoneInputProps {
    label?: string;
    value: string;  // E.164 format: +5511999999999
    onChange: (value: string) => void;  // Returns E.164 format
    error?: string;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
}

export function PhoneInput({
    label,
    value,
    onChange,
    error,
    required,
    disabled,
    placeholder = "(11) 98765-4321",
}: PhoneInputProps) {
    // Extract country and phone number from value
    const [selectedCountry, setSelectedCountry] = useState<CountryCode>(() => {
        if (value) {
            return extractCountryFromPhone(value) || getDefaultCountry();
        }
        return getDefaultCountry();
    });

    const [phoneNumber, setPhoneNumber] = useState(() => {
        if (value && value.startsWith(selectedCountry.dialCode)) {
            return value.substring(selectedCountry.dialCode.length);
        }
        return "";
    });

    // Update phone number when value changes externally
    useEffect(() => {
        if (value) {
            const country = extractCountryFromPhone(value) || getDefaultCountry();
            setSelectedCountry(country);
            if (value.startsWith(country.dialCode)) {
                setPhoneNumber(value.substring(country.dialCode.length));
            }
        }
    }, [value]);

    const handleCountryChange = (country: CountryCode) => {
        setSelectedCountry(country);
        // Rebuild the full number with new country code
        const cleaned = removeNonNumeric(phoneNumber);
        if (cleaned) {
            onChange(`${country.dialCode}${cleaned}`);
        } else {
            onChange("");
        }
    };

    const handlePhoneChange = (newPhone: string) => {
        setPhoneNumber(newPhone);
        // Build E.164 format
        const cleaned = removeNonNumeric(newPhone);
        if (cleaned) {
            onChange(`${selectedCountry.dialCode}${cleaned}`);
        } else {
            onChange("");
        }
    };

    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="flex items-stretch">
                <CountryCodeSelect
                    value={selectedCountry}
                    onChange={handleCountryChange}
                    disabled={disabled}
                />

                <div className="flex-1">
                    <MaskedInput
                        type="tel"
                        maskType={selectedCountry.code === 'BR' ? 'phone' : undefined}
                        value={phoneNumber}
                        onValueChange={handlePhoneChange}
                        placeholder={placeholder}
                        error={error}
                        disabled={disabled}
                        className="rounded-l-none border-l-0"
                    />
                </div>
            </div>

            {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
        </div>
    );
}
