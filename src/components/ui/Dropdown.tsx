"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
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
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
            <Popover.Trigger asChild>
                <button
                    className={cn(
                        "p-2 rounded-xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                        isOpen
                            ? "bg-primary/10 text-primary shadow-inner"
                            : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    )}
                >
                    {trigger || <MoreVertical size={20} />}
                </button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    align={align === "right" ? "end" : "start"}
                    sideOffset={5}
                    className={cn(
                        "z-[9999] w-[220px] rounded-2xl shadow-2xl border border-white/20",
                        "bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60",
                        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                        "flex flex-col gap-0.5 p-1.5 focus:outline-none"
                    )}
                >
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
                                    "w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-bold transition-all rounded-xl group select-none outline-none",
                                    "focus:bg-gray-50 focus:text-primary active:scale-95",
                                    option.variant === "danger"
                                        ? "text-red-500 hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600"
                                        : option.variant === "success"
                                            ? "text-green-600 hover:bg-green-50 focus:bg-green-50"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-primary hover:translate-x-1 focus:translate-x-1"
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
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}
