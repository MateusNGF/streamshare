"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";

interface DropdownOption {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: "default" | "danger";
}

interface DropdownProps {
    options: DropdownOption[];
}

export function Dropdown({ options }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-gray-100 rounded-full transition-all"
            >
                <MoreVertical size={20} className="text-gray-500" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10 animate-in fade-in zoom-in-95 duration-100">
                    {options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                option.onClick();
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium transition-all ${option.variant === "danger"
                                    ? "text-red-600 hover:bg-red-50"
                                    : "text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            {option.icon}
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
