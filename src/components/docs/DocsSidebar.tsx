'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowLeft } from 'lucide-react';
import { SidebarSection } from '@/lib/docs';
import { SearchCommand } from './SearchCommand';

interface DocsSidebarProps {
    sections: SidebarSection[];
}

export function DocsSidebar({ sections }: DocsSidebarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Header & Hamburger */}
            <div className="md:hidden w-full sticky top-0 z-30 flex items-center justify-between p-4 border-b border-gray-200 bg-white min-h-[64px]">
                <Link
                    href="/dashboard"
                    className="flex items-center text-sm font-medium text-gray-600 hover:text-violet-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                </Link>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 -mr-2 text-gray-600 hover:text-violet-600 focus:outline-none"
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar Overlay (Mobile) */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Content */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out
                md:sticky md:top-0 md:h-screen md:translate-x-0 md:flex md:flex-col
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 md:p-8 flex flex-col h-full auto-rows-max overflow-y-auto">
                    {/* Back Button (Desktop) */}
                    <Link
                        href="/dashboard"
                        className="hidden md:flex items-center text-sm font-medium text-gray-500 hover:text-violet-600 transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 text-current" />
                        Voltar ao Dashboard
                    </Link>

                    <h3 className="font-semibold text-gray-900 text-xl mb-5">Central de Ajuda</h3>

                    <SearchCommand sections={sections} />

                    <nav className="space-y-8 flex-1 pb-4">
                        {sections.map((section, idx) => (
                            <div key={idx}>
                                <h4 className="font-bold text-[11px] text-gray-900 uppercase tracking-widest mb-4">
                                    {section.title}
                                </h4>
                                <ul className="space-y-1">
                                    {section.items.map((item, itemIdx) => {
                                        const href = `/docs/${item.slug}`;
                                        const isActive = pathname === href;

                                        return (
                                            <li key={itemIdx}>
                                                <Link
                                                    href={href}
                                                    onClick={() => setIsOpen(false)}
                                                    className={`
                            block text-sm py-2 px-3 -mx-3 rounded-lg transition-all duration-200 font-medium
                            ${isActive
                                                            ? 'bg-violet-50 text-violet-700 shadow-sm ring-1 ring-violet-200/50'
                                                            : 'text-gray-600 hover:text-gray-900 hover:bg-white hover:translate-x-1'}
                          `}
                                                >
                                                    {item.title}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </div>
            </aside>
        </>
    );
}
