"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LegalHeaderProps {
    title: string;
    subtitle?: string;
    badgeText?: string;
    badgeIcon: LucideIcon;
    otherLinkText: string;
    otherLinkHref: string;
}

export function LegalHeader({
    title,
    subtitle,
    badgeText,
    badgeIcon: BadgeIcon,
    otherLinkText,
    otherLinkHref
}: LegalHeaderProps) {
    const router = useRouter();

    return (
        <div className="container mx-auto px-6 max-w-3xl mb-16">
            <div className="flex items-center justify-between mb-12">
                <button
                    onClick={() => router.back()}
                    className="group flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-primary transition-all"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Retornar
                </button>

                <Link
                    href={otherLinkHref}
                    className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-1"
                >
                    {otherLinkText}
                </Link>
            </div>

            <div className="space-y-4">
                {badgeText && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
                        <BadgeIcon size={12} className="text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{badgeText}</span>
                    </div>
                )}
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-gray-400 text-sm font-medium">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
}
