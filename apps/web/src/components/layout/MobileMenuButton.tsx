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
            className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-lg border border-gray-100 hover:bg-gray-50 transition-all touch-manipulation"
        >
            {isOpen ? (
                <X size={24} className="text-gray-900" />
            ) : (
                <Menu size={24} className="text-gray-900" />
            )}
        </button>
    );
}
