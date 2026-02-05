"use client";

import { Modal } from "@/components/ui/Modal";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { Skeleton } from "@/components/ui/Skeleton";
import { Bell } from "lucide-react";

interface NotificationsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Notificações"
            className="sm:max-w-md"
        >
            <div className="relative">
                {/* Background Skeletons */}
                <div className="space-y-4 opacity-50 blur-[2px] pointer-events-none select-none" aria-hidden="true">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex gap-4 p-4 rounded-2xl border border-gray-100">
                            <Skeleton variant="circular" width={40} height={40} className="shrink-0" />
                            <div className="space-y-2 w-full">
                                <Skeleton variant="text" width="60%" className="h-5" />
                                <Skeleton variant="text" width="90%" className="h-4" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Coming Soon Overlay */}
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                    <ComingSoon
                        title="Em breve"
                        description="Sua central de notificações está sendo preparada."
                        icon={Bell}
                    />
                </div>
            </div>
        </Modal>
    );
}
