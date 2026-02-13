"use client";

import { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import {
    PASSWORD_REQUIREMENTS,
    getMetRequirements,
    getPasswordStrength,
    getPasswordStrengthLabel,
} from "@/lib/password-validation";

interface PasswordInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    showRequirements?: boolean;
    showStrength?: boolean;
    error?: string;
    disabled?: boolean;
}

export function PasswordInput({
    label,
    value,
    onChange,
    placeholder = "••••••••",
    required = false,
    showRequirements = false,
    showStrength = false,
    error,
    disabled = false,
}: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const metRequirements = getMetRequirements(value);
    const strength = showStrength ? getPasswordStrength(value) : 0;
    const strengthLabel = showStrength ? getPasswordStrengthLabel(strength) : null;

    return (
        <div className="space-y-3">
            {/* Password Input with Toggle */}
            <div className="relative">
                <Input
                    label={label}
                    type={showPassword ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    error={error}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[42px] text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    tabIndex={-1}
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>

            {/* Password Strength Indicator */}
            {showStrength && value && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Força da senha:</span>
                        <span className={`font-semibold ${strengthLabel?.color}`}>
                            {strengthLabel?.label}
                        </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-300 ${strength < 40
                                    ? "bg-red-500"
                                    : strength < 70
                                        ? "bg-yellow-500"
                                        : strength < 90
                                            ? "bg-green-500"
                                            : "bg-green-600"
                                }`}
                            style={{ width: `${strength}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Password Requirements */}
            {showRequirements && (
                <div className="bg-blue-50 p-4 rounded-xl text-xs text-gray-700 border border-blue-100">
                    <p className="font-semibold mb-2">Requisitos da senha:</p>
                    <ul className="space-y-1.5">
                        {PASSWORD_REQUIREMENTS.map((requirement) => {
                            const isMet = metRequirements.includes(requirement.id);
                            return (
                                <li
                                    key={requirement.id}
                                    className={`flex items-center gap-2 transition-colors ${value
                                            ? isMet
                                                ? "text-green-700"
                                                : "text-red-600"
                                            : "text-gray-600"
                                        }`}
                                >
                                    {value && (
                                        <span className="flex-shrink-0">
                                            {isMet ? (
                                                <Check size={14} className="text-green-600" />
                                            ) : (
                                                <X size={14} className="text-red-500" />
                                            )}
                                        </span>
                                    )}
                                    <span>{requirement.label}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}
