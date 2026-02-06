"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                // If checking against the dropdown content is needed, we'd need a ref for content too
                // But since logic is: click anything else -> close
                // We just need to check if we didn't click the portal content
                // Getting ref to portal content is tricky across portal.
                // Simpler approach: Check if target is not button.
                // But if we click inside the dropdown, we handle it in option click.
                // We need to ensure we don't close immediately if clicking inside menu.
                // Using a specific class or check might be needed.
            }
        };

        // Better approach for Portal outside click:
        // Identify the dropdown menu element by ID or ref passed through.

        const closeMenu = (e: MouseEvent) => {
            // We will check if the click was inside the button
            if (buttonRef.current?.contains(e.target as Node)) {
                return;
            }
            // For the menu content, we can use a ref or check closest
            const target = e.target as Element;
            if (target.closest('[data-dropdown-portal]')) {
                return;
            }
            setIsOpen(false);
        };

        if (isOpen) {
            window.addEventListener("mousedown", closeMenu);
            window.addEventListener("resize", () => setIsOpen(false));
            window.addEventListener("scroll", () => setIsOpen(false), true);
        }

        return () => {
            window.removeEventListener("mousedown", closeMenu);
            window.removeEventListener("resize", () => setIsOpen(false));
            window.removeEventListener("scroll", () => setIsOpen(false), true);
        };
    }, [isOpen]);

    const toggleDropdown = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            // Align right edge of menu with right edge of button
            // w-48 is 12rem = 192px
            const MENU_WIDTH = 192;
            setPosition({
                top: rect.bottom + window.scrollY + 8, // 8px gap
                left: rect.right + window.scrollX - MENU_WIDTH
            });
        }
        setIsOpen(!isOpen);
    };

    return (
        <>
            <button
                ref={buttonRef}
                onClick={toggleDropdown}
                className="p-2 hover:bg-gray-100 rounded-full transition-all"
            >
                <MoreVertical size={20} className="text-gray-500" />
            </button>

            {isOpen && createPortal(
                <div
                    data-dropdown-portal
                    className="fixed z-[9999] w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-scale-in origin-top-left duration-200"
                    style={{
                        top: position.top,
                        left: position.left,
                    }}
                >
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
                </div>,
                document.body
            )}
        </>
    );
}
