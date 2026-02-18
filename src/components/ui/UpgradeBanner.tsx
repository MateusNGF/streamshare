import React from 'react';
import { Sparkles, LucideIcon, Zap, ShieldAlert, Crown, Info, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

export type UpgradeBannerVariant = 'primary' | 'glass' | 'gold' | 'warning' | 'minimal' | 'info';
export type UpgradeBannerSize = 'compact' | 'normal' | 'large';

interface UpgradeBannerProps {
    title: string;
    description: string;
    icon?: LucideIcon;
    buttonText?: string;
    buttonHref?: string;
    onClick?: () => void;
    className?: string;
    variant?: UpgradeBannerVariant;
    size?: UpgradeBannerSize;
    layout?: 'auto' | 'vertical' | 'horizontal';
}

const VARIANTS: Record<UpgradeBannerVariant, { container: string; iconContainer: string; button: string; iconDefault: LucideIcon }> = {
    primary: {
        container: "bg-gradient-to-br from-white via-indigo-50/40 to-blue-50/60 border-indigo-100/50 hover:shadow-indigo-500/5 hover:border-indigo-200/50",
        iconContainer: "bg-white text-primary ring-indigo-50/50",
        button: "bg-primary text-white shadow-primary/20 hover:bg-primary/90",
        iconDefault: Sparkles
    },
    glass: {
        container: "bg-white/40 backdrop-blur-md border-white/40 hover:bg-white/60 hover:border-white/60 shadow-sm",
        iconContainer: "bg-white/80 text-primary ring-white/20",
        button: "bg-primary text-white shadow-primary/10 hover:bg-primary/90",
        iconDefault: Zap
    },
    gold: {
        container: "bg-gradient-to-br from-[#FFFBF0] via-[#FFD700]/5 to-[#FFFBF0] border-[#FFD700]/30 hover:shadow-yellow-500/10 hover:border-[#FFD700]/50",
        iconContainer: "bg-white text-[#B8860B] ring-yellow-100/50 shadow-[0_0_15px_rgba(255,215,0,0.2)]",
        button: "bg-gradient-to-r from-[#B8860B] via-[#FFD700] to-[#B8860B] text-white shadow-yellow-600/20 hover:brightness-110",
        iconDefault: Crown
    },
    warning: {
        container: "bg-gradient-to-br from-white via-rose-50/30 to-orange-50/40 border-rose-100/50 hover:shadow-rose-500/5 hover:border-rose-200/50",
        iconContainer: "bg-white text-rose-500 ring-rose-50/50",
        button: "bg-rose-500 text-white shadow-rose-500/20 hover:bg-rose-600",
        iconDefault: ShieldAlert
    },
    info: {
        container: "bg-gradient-to-br from-white via-sky-50/30 to-blue-50/40 border-sky-100/50 hover:shadow-sky-500/5 hover:border-sky-200/50",
        iconContainer: "bg-white text-sky-500 ring-sky-50/50",
        button: "bg-sky-500 text-white shadow-sky-500/20 hover:bg-sky-600",
        iconDefault: Info
    },
    minimal: {
        container: "bg-white border-gray-200 hover:border-primary/30 hover:shadow-sm",
        iconContainer: "bg-gray-50 text-gray-400 ring-gray-100 group-hover:text-primary group-hover:bg-primary/5 group-hover:ring-primary/10",
        button: "bg-gray-900 text-white hover:bg-gray-800",
        iconDefault: Star
    }
};

const SIZE_CLASSES = {
    compact: {
        wrapper: 'p-3 sm:p-4 gap-4',
        content: 'gap-3',
        icon: 'p-2',
        iconSize: 18,
        sparkleSize: 12,
        title: 'text-xs sm:text-sm',
        desc: 'text-[10px] sm:text-[11px] max-w-[280px]',
        btn: 'px-4 py-2 text-[10px]'
    },
    normal: {
        wrapper: 'p-4 sm:p-5 gap-5',
        content: 'gap-4',
        icon: 'p-3',
        iconSize: 22,
        sparkleSize: 14,
        title: 'text-sm sm:text-base',
        desc: 'text-[11px] sm:text-xs max-w-[400px]',
        btn: 'px-6 py-2.5 text-[11px] sm:text-xs'
    },
    large: {
        wrapper: 'p-6 sm:p-8 gap-8',
        content: 'gap-4',
        icon: 'p-4',
        iconSize: 28,
        sparkleSize: 18,
        title: 'text-lg sm:text-xl',
        desc: 'text-sm sm:text-base max-w-[500px]',
        btn: 'px-8 py-4 text-sm sm:text-base'
    }
};

export function UpgradeBanner({
    title,
    description,
    icon,
    buttonText = "Conhecer planos",
    buttonHref = "/planos",
    onClick,
    className = "",
    variant = 'primary',
    size = 'normal',
    layout = 'auto'
}: UpgradeBannerProps) {
    const router = useRouter();
    const currentVariant = VARIANTS[variant];
    const currentSize = SIZE_CLASSES[size];
    const Icon = icon || currentVariant.iconDefault;

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            router.push(buttonHref);
        }
    };

    const getLayoutClasses = () => {
        if (layout === 'vertical') return 'flex-col';
        if (layout === 'horizontal') return 'flex-row';
        return 'flex-col sm:flex-row';
    };

    const getAlignmentClasses = () => {
        if (layout === 'vertical') return 'items-start';
        if (layout === 'horizontal') return 'items-center';
        return 'items-center sm:items-center'; // Default responsive behavior
    };

    const getWidthClasses = () => {
        if (layout === 'vertical') return 'w-full';
        if (layout === 'horizontal') return 'w-auto';
        return 'w-full sm:w-auto';
    };

    return (
        <div className={`
            rounded-2xl border flex justify-between group transition-all duration-300
            ${getLayoutClasses()}
            ${getAlignmentClasses()}
            ${currentVariant.container}
            ${currentSize.wrapper}
            ${className}
        `}>
            <div className={`flex items-center ${currentSize.content} ${getWidthClasses()}`}>
                <div className={`
                    rounded-2xl shadow-sm group-hover:scale-110 transition-transform flex-shrink-0 ring-4
                    ${currentVariant.iconContainer}
                    ${currentSize.icon}
                `}>
                    <Icon size={currentSize.iconSize} className={variant === 'minimal' ? '' : 'animate-pulse'} />
                </div>
                <div className="space-y-0.5">
                    <h4 className={`
                        font-bold text-gray-900 tracking-tight leading-tight
                        ${currentSize.title}
                    `}>
                        {title}
                    </h4>
                    <p className={`
                        text-gray-500 leading-relaxed italic
                        ${currentSize.desc}
                    `}>
                        {description}
                    </p>
                </div>
            </div>

            <button
                onClick={handleClick}
                className={`
                    ${getWidthClasses()} font-bold rounded-xl shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 flex-shrink-0
                    ${currentVariant.button}
                    ${currentSize.btn}
                `}
            >
                {buttonText}
                <Sparkles size={currentSize.sparkleSize} />
            </button>
        </div>
    );
}
