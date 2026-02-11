"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropdownOption {
    label?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    variant?: "default" | "danger" | "success";
    type?: "item" | "separator";
}

interface DropdownProps {
    options: DropdownOption[];
    trigger?: React.ReactNode;
    align?: "left" | "right";
}

export function Dropdown({ options, trigger, align = "right" }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        const closeMenu = (e: MouseEvent) => {
            if (buttonRef.current?.contains(e.target as Node)) {
                return;
            }
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
            const MENU_WIDTH = 220; // Aumentado para mais respiro

            const top = rect.bottom + window.scrollY + 8;
            let left = align === "right"
                ? rect.right + window.scrollX - MENU_WIDTH
                : rect.left + window.scrollX;

            // Ajuste básico de bordas da tela
            if (left < 10) left = 10;
            if (left + MENU_WIDTH > window.innerWidth - 10) {
                left = window.innerWidth - MENU_WIDTH - 10;
            }

            setPosition({ top, left });
        }
        setIsOpen(!isOpen);
    };

    return (
        <>
            <button
                ref={buttonRef}
                onClick={toggleDropdown}
                className={cn(
                    "p-2 rounded-xl transition-all duration-200 active:scale-90",
                    isOpen
                        ? "bg-primary/10 text-primary shadow-inner"
                        : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                )}
            >
                {trigger || <MoreVertical size={20} />}
            </button>

            {isOpen && createPortal(
                <div
                    data-dropdown-portal
                    className={cn(
                        "fixed z-[9999] w-[220px] rounded-2xl shadow-2xl border border-white/20 py-2",
                        "glass animate-scale-in origin-top duration-200 overflow-hidden"
                    )}
                    style={{
                        top: position.top,
                        left: position.left,
                    }}
                >
                    <div className="flex flex-col gap-0.5 px-1.5">
                        {options.map((option, index) => {
                            if (option.type === "separator") {
                                return (
                                    <div
                                        key={`sep-${index}`}
                                        className="h-px bg-gray-100/50 my-1 mx-2"
                                    />
                                );
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => {
                                        option.onClick?.();
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-bold transition-all rounded-xl group",
                                        option.variant === "danger"
                                            ? "text-red-500 hover:bg-red-50 hover:text-red-600"
                                            : option.variant === "success"
                                                ? "text-green-600 hover:bg-green-50"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-primary hover:translate-x-1"
                                    )}
                                >
                                    <div className={cn(
                                        "flex-shrink-0 transition-transform group-hover:scale-110",
                                        option.variant === "danger" ? "text-red-400 group-hover:text-red-500" :
                                            option.variant === "success" ? "text-green-400 group-hover:text-green-500" :
                                                "text-gray-400 group-hover:text-primary"
                                    )}>
                                        {option.icon}
                                    </div>
                                    <span className="truncate">
                                        {option.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
