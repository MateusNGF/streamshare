"use client";

import { ReactNode, useState } from "react";
import { Copy, CheckCircle2 } from "lucide-react";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";

interface LegalSectionProps {
    id: string;
    index?: string;
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
    isHighlighted?: boolean;
}

export function LegalSection({
    id,
    index,
    title,
    description,
    children,
    className,
    isHighlighted = false
}: LegalSectionProps) {
    const [copied, setCopied] = useState(false);
    const displayTitle = index ? `${index}. ${title}` : title;

    const handleCopyLink = () => {
        const url = new URL(window.location.href);
        url.hash = id;
        navigator.clipboard.writeText(url.toString());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section
            id={id}
            className={cn(
                "scroll-mt-24 group/section",
                isHighlighted && "bg-primary/[0.02] border-y border-primary/5 py-12 px-6 rounded-3xl",
                className
            )}
        >
            <div className="flex items-start justify-between gap-3 mb-8">
                <SectionHeader
                    title={displayTitle}
                    description={description}
                    className="flex-1 min-w-0"
                />
                <Tooltip
                    content={copied ? "Link copiado!" : "Copiar link desta seção"}
                    isVisible={copied}
                    position="left"
                >
                    <button
                        onClick={handleCopyLink}
                        className="mt-1 p-2 rounded-xl bg-gray-50 text-gray-300 hover:text-primary hover:bg-primary/5 transition-all cursor-pointer shrink-0"
                        aria-label={`Copiar link da seção ${title}`}
                    >
                        {copied ? (
                            <CheckCircle2 size={15} className="text-green-500" />
                        ) : (
                            <Copy size={15} />
                        )}
                    </button>
                </Tooltip>
            </div>
            <div className="prose prose-gray max-w-none text-gray-700 leading-loose text-justify">
                {children}
            </div>
        </section>
    );
}
