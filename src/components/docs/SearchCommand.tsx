'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { Search, FileText, X } from 'lucide-react';
import { SidebarSection } from '@/lib/docs';

interface SearchCommandProps {
    sections: SidebarSection[];
}

export function SearchCommand({ sections }: SearchCommandProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    // Flatten sections for search
    const allDocs = useMemo(() => {
        return sections.flatMap(section =>
            section.items.map(item => ({
                ...item,
                sectionTitle: section.title
            }))
        );
    }, [sections]);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const handleSelect = (slug: string) => {
        setOpen(false);
        router.push(`/docs/${slug}`);
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="w-full flex items-center gap-2 pl-3 pr-2 py-2 mb-6 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            >
                <Search className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">Buscar artigos...</span>
                <div className="hidden md:flex items-center gap-1">
                    <kbd className="font-sans px-1.5 py-0.5 text-[10px] font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded">⌘</kbd>
                    <kbd className="font-sans px-1.5 py-0.5 text-[10px] font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded">K</kbd>
                </div>
            </button>

            {open && (
                <Command.Dialog
                    open={open}
                    onOpenChange={setOpen}
                    className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[20vh] p-4"
                >
                    <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <Command
                            className="w-full flex flex-col"
                            shouldFilter={true}
                            loop
                        >
                            <div className="flex items-center border-b border-gray-100 px-3">
                                <Search className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
                                <Command.Input
                                    autoFocus
                                    placeholder="Procurar documentação..."
                                    className="flex-1 h-14 bg-transparent outline-none placeholder:text-gray-400 text-gray-900"
                                />
                                <button
                                    onClick={() => setOpen(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
                                >
                                    <X className="w-4 h-4" />
                                    <span className="sr-only">Fechar</span>
                                </button>
                            </div>

                            <Command.List className="max-h-[300px] overflow-y-auto p-2 scroll-smooth">
                                <Command.Empty className="py-6 text-center text-sm text-gray-500">
                                    Nenhum artigo encontrado.
                                </Command.Empty>

                                {sections.map((section) => (
                                    <Command.Group
                                        key={section.title}
                                        heading={section.title}
                                        className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-gray-500 [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider mb-2"
                                    >
                                        {section.items.map((item) => (
                                            <Command.Item
                                                key={item.slug}
                                                value={`${item.title} ${section.title}`}
                                                onSelect={() => handleSelect(item.slug)}
                                                className="flex items-center gap-2 px-2 py-2.5 text-sm rounded-lg cursor-pointer aria-selected:bg-violet-50 aria-selected:text-violet-700 text-gray-700 transition-colors"
                                            >
                                                <FileText className="w-4 h-4 text-gray-400" />
                                                <span>{item.title}</span>
                                            </Command.Item>
                                        ))}
                                    </Command.Group>
                                ))}
                            </Command.List>
                        </Command>
                    </div>
                </Command.Dialog>
            )}
        </>
    );
}
