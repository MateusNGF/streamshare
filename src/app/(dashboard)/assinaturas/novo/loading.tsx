import { Skeleton } from "@/components/ui/Skeleton";
import { Wand2, X } from "lucide-react";

export default function Loading() {
    return (
        <div className="min-h-screen bg-[#fcfcfd] pb-32">
            <div className="max-w-6xl mx-auto px-4 pt-8">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-100 rounded-2xl ring-1 ring-gray-200">
                            <Wand2 size={28} className="text-gray-300" />
                        </div>
                        <div>
                            <Skeleton variant="text" className="h-8 w-48 mb-2" />
                            <Skeleton variant="text" className="h-4 w-64 opacity-60" />
                        </div>
                    </div>
                    <div className="rounded-full w-10 h-10 bg-gray-50 flex items-center justify-center">
                        <X size={20} className="text-gray-200" />
                    </div>
                </div>

                {/* Content Skeleton (mimicking StepStreamings grid) */}
                <div className="space-y-4">
                    <div className="mb-8">
                        <Skeleton variant="text" className="h-7 w-56 mb-2" />
                        <Skeleton variant="text" className="h-4 w-80 opacity-60" />
                    </div>

                    <div className="relative mb-6">
                        <Skeleton variant="rectangular" className="w-full h-12 rounded-xl" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="p-4 rounded-2xl border border-gray-100 bg-white h-40 flex flex-col justify-between">
                                <div>
                                    <Skeleton variant="rectangular" className="w-12 h-12 rounded-2xl mb-3" />
                                    <Skeleton variant="text" className="h-4 w-24 mb-1" />
                                    <Skeleton variant="text" className="h-3 w-16 opacity-60" />
                                </div>
                                <Skeleton variant="text" className="h-4 w-20" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Skeleton */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 p-4 lg:p-6 z-50">
                <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-4">
                    <div className="flex gap-2.5">
                        <div className="h-1.5 w-12 rounded-full bg-gray-200" />
                        <div className="h-1.5 w-12 rounded-full bg-gray-100" />
                        <div className="h-1.5 w-12 rounded-full bg-gray-100" />
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <Skeleton variant="rectangular" className="flex-1 sm:w-32 h-12 rounded-2xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}
