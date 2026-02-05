import { Menu, X } from "lucide-react";

interface MobileMenuButtonProps {
    isOpen: boolean;
    onClick: () => void;
}

export function MobileMenuButton({ isOpen, onClick }: MobileMenuButtonProps) {
    return (
        <button
            onClick={onClick}
            aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isOpen}
            className="lg:hidden z-[99] p-2 bg-white rounded-xl  border border-gray-100  transition-all touch-manipulation"
        >
            {isOpen ? (
                <X size={24} className="text-gray-900" />
            ) : (
                <Menu size={24} className="text-gray-900" />
            )}
        </button>
    );
}
