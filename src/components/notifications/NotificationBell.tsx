import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
    unreadCount: number;
    onClick?: () => void;
    className?: string;
    badgeClassName?: string;
    isInteractive?: boolean;
}

export function NotificationBell({
    unreadCount,
    onClick,
    className,
    badgeClassName,
    isInteractive = true
}: NotificationBellProps) {
    const Component = isInteractive ? "button" : "div";

    return (
        <Component
            onClick={isInteractive ? onClick : undefined}
            aria-label="Notificações"
            className={cn(
                "relative flex items-center justify-center", // Base layout
                isInteractive && "p-2 text-gray-500 hover:text-gray-900 touch-manipulation transition-colors", // Interactive styles
                !isInteractive && "text-gray-400", // Non-interactive base style (align with sidebar icons)
                className
            )}
        >
            <Bell size={20} />
            {unreadCount > 0 && (
                <span className={cn(
                    "absolute flex items-center justify-center text-white text-[10px] font-bold border-2 border-white px-1 shadow-sm bg-red-500 rounded-full",
                    // Default positioning (works well with p-2)
                    "top-1 right-1 min-w-[18px] h-[18px]",
                    badgeClassName
                )}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </Component>
    );
}
