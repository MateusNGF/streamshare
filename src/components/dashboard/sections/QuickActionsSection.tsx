"use client";

import {
    Plus,
    Users2,
    MessageSquare,
    Globe
} from "lucide-react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface QuickActionProps {
    onOpenStreamingModal: () => void;
    onOpenAddMemberModal: () => void;
}

export function QuickActionsSection({ onOpenStreamingModal, onOpenAddMemberModal }: QuickActionProps) {
    return (
        <section className="relative">
            <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-6 bg-primary rounded-full" />
                <h2 className="text-xl font-bold text-gray-900">Ações Rápidas</h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <QuickActionButton
                    icon={Plus}
                    label="Novo Streaming"
                    color="bg-violet-600 shadow-violet-200"
                    onClick={onOpenStreamingModal}
                />
                <QuickActionButton
                    icon={Users2}
                    label="Convidar Membro"
                    color="bg-blue-600 shadow-blue-200"
                    onClick={onOpenAddMemberModal}
                />
                <QuickActionButton
                    icon={Globe}
                    label="Explorar Vagas"
                    color="bg-indigo-600 shadow-indigo-200"
                    href="/explore"
                />
                <QuickActionButton
                    icon={MessageSquare}
                    label="Suporte"
                    color="bg-emerald-600 shadow-emerald-200"
                    onClick={() => (window as any).$chat?.open()}
                />
            </div>
        </section>
    );
}

interface QuickActionButtonProps {
    icon: LucideIcon;
    label: string;
    color: string;
    onClick?: () => void;
    href?: string;
}

function QuickActionButton({ icon: Icon, label, color, onClick, href }: QuickActionButtonProps) {
    const content = (
        <div className="group flex flex-col items-center gap-4">
            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-[24px] ${color} flex items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300`}>
                <Icon size={24} className="md:size-30" />
            </div>
            <span className="text-xs md:text-sm font-bold text-gray-500 group-hover:text-primary transition-colors text-center">{label}</span>
        </div>
    );

    const baseClass = "bg-white p-6 md:p-8 rounded-[32px] border border-gray-50 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all outline-none focus:ring-2 focus:ring-primary/20 flex items-center justify-center";

    if (href) {
        return (
            <Link href={href} className={baseClass}>
                {content}
            </Link>
        );
    }

    return (
        <button onClick={onClick} className={baseClass}>
            {content}
        </button>
    );
}
