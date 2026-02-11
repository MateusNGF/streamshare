import { cn } from "@/lib/utils";

type StreamingLogoSize = "xs" | "sm" | "md" | "lg";
type StreamingLogoRounded = "md" | "lg" | "xl" | "2xl";

interface StreamingLogoProps {
    /** Nome do streaming (usado como alt text e fallback) */
    name: string;
    /** Cor de fundo do container */
    color?: string;
    /** URL do ícone/logo */
    iconeUrl?: string | null;
    /** Tamanho predefinido */
    size?: StreamingLogoSize;
    /** Border radius */
    rounded?: StreamingLogoRounded;
    /** Classes extras no container */
    className?: string;
}

const sizeConfig: Record<StreamingLogoSize, { container: string; icon: string; text: string }> = {
    xs: { container: "w-6 h-6", icon: "w-4 h-4", text: "text-[10px]" },
    sm: { container: "w-8 h-8", icon: "w-5 h-5", text: "text-xs" },
    md: { container: "w-10 h-10", icon: "w-6 h-6", text: "text-sm" },
    lg: { container: "w-12 h-12", icon: "w-8 h-8", text: "text-lg" },
};

const roundedConfig: Record<StreamingLogoRounded, string> = {
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
};

/**
 * Componente reutilizável que exibe o ícone/logo de um streaming.
 *
 * Renderiza um container colorido com o ícone do catálogo (se disponível)
 * ou a primeira letra do nome como fallback.
 */
export function StreamingLogo({
    name,
    color = "#6d28d9",
    iconeUrl,
    size = "md",
    rounded = "xl",
    className,
}: StreamingLogoProps) {
    const sizes = sizeConfig[size];
    const initial = name?.charAt(0).toUpperCase() || "?";

    return (
        <div
            className={cn(
                "flex items-center justify-center text-white font-bold shadow-sm overflow-hidden shrink-0",
                sizes.container,
                sizes.text,
                roundedConfig[rounded],
                className
            )}
            style={{ backgroundColor: color }}
        >
            {iconeUrl ? (
                <img
                    src={iconeUrl}
                    alt={name}
                    className={cn("object-contain brightness-0 invert", sizes.icon)}
                />
            ) : (
                initial
            )}
        </div>
    );
}
