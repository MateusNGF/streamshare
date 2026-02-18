"use client";

import { FileCheck } from "lucide-react";

interface TOCItem {
    id: string;
    label: string;
}

interface LegalTableOfContentsProps {
    items: TOCItem[];
}

export function LegalTableOfContents({ items }: LegalTableOfContentsProps) {
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-white border border-gray-100 rounded-[2rem] p-8 md:p-10 mb-20 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                <FileCheck size={14} className="text-primary" />
                Sumário Executivo
            </h3>
            <nav className="grid md:grid-cols-2 gap-x-12 gap-y-3">
                {items.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className="text-left text-sm font-semibold text-gray-500 hover:text-primary transition-colors py-1 flex items-center gap-2 group"
                    >
                        <span className="w-1 h-1 rounded-full bg-gray-200 group-hover:bg-primary transition-colors" />
                        {item.label}
                    </button>
                ))}
            </nav>
        </div>
    );
}
