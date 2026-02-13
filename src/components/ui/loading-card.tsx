import { Skeleton } from "./skeleton";

interface LoadingCardProps {
    variant?: "default" | "compact" | "detailed";
}

export function LoadingCard({ variant = "default" }: LoadingCardProps) {
    if (variant === "compact") {
        return (
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <Skeleton variant="circular" width={40} height={40} />
                    <div className="flex-1 space-y-2">
                        <Skeleton variant="text" className="w-3/4" />
                        <Skeleton variant="text" className="w-1/2 h-3" />
                    </div>
                </div>
            </div>
        );
    }

    if (variant === "detailed") {
        return (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-start gap-4 mb-4">
                    <Skeleton variant="circular" width={56} height={56} />
                    <div className="flex-1 space-y-2">
                        <Skeleton variant="text" className="w-2/3 h-5" />
                        <Skeleton variant="text" className="w-1/2 h-3" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Skeleton variant="text" className="w-full h-3" />
                    <Skeleton variant="text" className="w-5/6 h-3" />
                    <Skeleton variant="text" className="w-4/6 h-3" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-3">
                <Skeleton variant="circular" width={48} height={48} />
                <div className="flex-1 space-y-2">
                    <Skeleton variant="text" className="w-3/4 h-4" />
                    <Skeleton variant="text" className="w-1/2 h-3" />
                </div>
            </div>
            <Skeleton variant="rectangular" className="w-full h-10" />
        </div>
    );
}
