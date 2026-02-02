"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

interface SelectContextValue {
    value: string;
    onValueChange: (value: string) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
    disabled?: boolean;
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined);

const useSelectContext = () => {
    const context = React.useContext(SelectContext);
    if (!context) {
        throw new Error("Select components must be used within a Select");
    }
    return context;
};

interface SelectProps {
    value?: string;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
    children: React.ReactNode;
}

const Select = ({ value = "", onValueChange, disabled, children }: SelectProps) => {
    const [open, setOpen] = React.useState(false);

    return (
        <SelectContext.Provider value={{ value, onValueChange: onValueChange || (() => { }), open, setOpen, disabled }}>
            <div className="relative">
                {children}
            </div>
        </SelectContext.Provider>
    );
};

interface SelectTriggerProps {
    className?: string;
    children: React.ReactNode;
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
    ({ className = "", children }, ref) => {
        const { open, setOpen, disabled } = useSelectContext();

        return (
            <button
                ref={ref}
                type="button"
                onClick={() => !disabled && setOpen(!open)}
                disabled={disabled}
                className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${open ? "border-primary ring-2 ring-primary/20" : "border-gray-200"
                    } ${className}`}
            >
                {children}
                <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
        );
    }
);
SelectTrigger.displayName = "SelectTrigger";

interface SelectValueProps {
    placeholder?: string;
}

const SelectValue = ({ placeholder }: SelectValueProps) => {
    const { value } = useSelectContext();

    return (
        <span className={value ? "text-gray-900" : "text-gray-500"}>
            {value || placeholder}
        </span>
    );
};

interface SelectContentProps {
    className?: string;
    children: React.ReactNode;
}

const SelectContent = ({ className = "", children }: SelectContentProps) => {
    const { open, setOpen } = useSelectContext();
    const contentRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open, setOpen]);

    if (!open) return null;

    return (
        <div
            ref={contentRef}
            className={`absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto ${className}`}
        >
            {children}
        </div>
    );
};

interface SelectItemProps {
    value: string;
    disabled?: boolean;
    children: React.ReactNode;
}

const SelectItem = ({ value, disabled, children }: SelectItemProps) => {
    const { value: selectedValue, onValueChange, setOpen } = useSelectContext();
    const isSelected = selectedValue === value;

    const handleClick = () => {
        if (!disabled) {
            onValueChange(value);
            setOpen(false);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`px-4 py-3 cursor-pointer transition-colors ${isSelected ? "bg-primary/10 text-primary font-medium" : "hover:bg-gray-50"
                } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
            {children}
        </div>
    );
};

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
