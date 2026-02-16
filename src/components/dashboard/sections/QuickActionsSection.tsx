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
        <section className="space-y-6">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-primary rounded-full" />
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Gestão Rápida</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                <QuickActionButton
                    icon={Plus}
                    label="Novo Streaming"
                    description="Criar novo grupo"
                    color="bg-violet-600 shadow-violet-200"
                    onClick={onOpenStreamingModal}
                />
                <QuickActionButton
                    icon={Users2}
                    label="Membros"
                    description="Convidar participante"
                    color="bg-blue-600 shadow-blue-200"
                    onClick={onOpenAddMemberModal}
                />
                <QuickActionButton
                    icon={Globe}
                    label="Vagas"
                    description="Explorar catálogo"
                    color="bg-indigo-600 shadow-indigo-200"
                    href="/explore"
                />
                <QuickActionButton
                    icon={MessageSquare}
                    label="Suporte"
                    description="Central de ajuda"
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
    description: string;
    color: string;
    onClick?: () => void;
    href?: string;
}

function QuickActionButton({ icon: Icon, label, description, color, onClick, href }: QuickActionButtonProps) {
    const content = (
        <div className="flex items-center gap-4 w-full">
            <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 shrink-0`}>
                <Icon size={20} />
            </div>
            <div className="text-left overflow-hidden">
                <span className="block text-[13px] font-black text-gray-900 group-hover:text-primary transition-colors leading-tight">{label}</span>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-tight mt-0.5 truncate">{description}</span>
            </div>
        </div>
    );

    const baseClass = "group bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 hover:-translate-y-1 transition-all outline-none focus:ring-2 focus:ring-primary/20 flex items-center w-full";

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
