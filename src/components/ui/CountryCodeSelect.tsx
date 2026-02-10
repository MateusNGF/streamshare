"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { COUNTRY_CODES, CountryCode } from "@/lib/country-codes";

interface CountryCodeSelectProps {
    value: CountryCode;
    onChange: (country: CountryCode) => void;
    disabled?: boolean;
}

export function CountryCodeSelect({ value, onChange, disabled }: CountryCodeSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearch("");
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen]);

    const filteredCountries = COUNTRY_CODES.filter((country) =>
        country.name.toLowerCase().includes(search.toLowerCase()) ||
        country.dialCode.includes(search) ||
        country.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`
                    group flex items-center gap-2 px-3 h-full 
                    border border-gray-200 rounded-l-xl 
                    bg-gradient-to-b from-white to-gray-50/50
                    hover:from-gray-50 hover:to-gray-100/50
                    transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed 
                    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                    shadow-sm hover:shadow
                    ${isOpen ? 'ring-2 ring-primary/20 border-primary' : ''}
                `}
                aria-label="Selecionar código do país"
            >
                <span className="text-2xl leading-none">{value.flag}</span>
                <span className="font-semibold text-gray-700 tracking-tight">{value.dialCode}</span>
                <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop overlay */}
                    <div className="fixed inset-0 z-40" />

                    <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 max-h-96 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Search input */}
                        <div className="p-3 border-b border-gray-100 bg-gradient-to-b from-gray-50/50 to-white">
                            <div className="relative">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Buscar país ou código..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none text-sm transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Country list */}
                        <div className="overflow-y-auto max-h-80 py-1">
                            {filteredCountries.length > 0 ? (
                                filteredCountries.map((country) => {
                                    const isSelected = value.code === country.code;
                                    return (
                                        <button
                                            key={country.code}
                                            type="button"
                                            onClick={() => {
                                                onChange(country);
                                                setIsOpen(false);
                                                setSearch("");
                                            }}
                                            className={`
                                                w-full flex items-center gap-3 px-4 py-3
                                                text-left transition-all duration-150
                                                ${isSelected
                                                    ? 'bg-primary/10 hover:bg-primary/15'
                                                    : 'hover:bg-gray-50'
                                                }
                                            `}
                                        >
                                            <span className="text-2xl leading-none">{country.flag}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className={`font-medium truncate ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                                                    {country.name}
                                                </div>
                                            </div>
                                            <span className={`text-sm font-mono font-semibold ${isSelected ? 'text-primary' : 'text-gray-500'}`}>
                                                {country.dialCode}
                                            </span>
                                            {isSelected && (
                                                <Check size={18} className="text-primary flex-shrink-0" />
                                            )}
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="px-4 py-12 text-center">
                                    <div className="text-4xl mb-2">🔍</div>
                                    <p className="text-gray-400 text-sm font-medium">
                                        Nenhum país encontrado
                                    </p>
                                    <p className="text-gray-300 text-xs mt-1">
                                        Tente buscar por outro nome
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
