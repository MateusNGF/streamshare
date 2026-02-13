import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-900 p-4">
            <div className="bg-white rounded-[32px] shadow-2xl p-8 md:p-12 w-full max-w-md">
                {/* Logo Skeleton */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <Skeleton variant="rectangular" className="w-16 h-16 rounded-2xl" />
                    <Skeleton variant="text" className="w-40 h-8" />
                </div>

                {/* Tab Switcher Skeleton (Only for login, but harmless here) */}
                <div className="flex gap-2 mb-8 bg-gray-100 rounded-xl p-1 h-14">
                    <div className="w-1/2 h-full rounded-lg bg-gray-200 animate-pulse"></div>
                    <div className="w-1/2 h-full rounded-lg bg-gray-200 animate-pulse"></div>
                </div>

                {/* Title Skeleton */}
                <div className="text-center mb-8 space-y-2">
                    <Skeleton variant="text" className="w-48 h-8 mx-auto" />
                    <Skeleton variant="text" className="w-64 h-4 mx-auto" />
                </div>

                {/* Form Inputs Skeleton */}
                <div className="space-y-4">
                    <Skeleton variant="rectangular" className="w-full h-12 rounded-xl" />
                    <Skeleton variant="rectangular" className="w-full h-12 rounded-xl" />
                    <Skeleton variant="rectangular" className="w-full h-12 rounded-xl" />
                </div>
            </div>
        </div>
    );
}
