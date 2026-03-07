'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface TocItem {
    level: number;
    text: string;
    id: string;
}

interface TableOfContentsProps {
    content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
    const [activeId, setActiveId] = useState<string>('');
    const [toc, setToc] = useState<TocItem[]>([]);

    useEffect(() => {
        // Extrai os headings (h2 e h3) diretamente do DOM renderizado pelo MDX
        const elements = document.querySelectorAll('.prose h2, .prose h3');
        const headings: TocItem[] = Array.from(elements).map((el) => ({
            level: el.tagName.toLowerCase() === 'h2' ? 2 : 3,
            text: el.textContent || '',
            id: el.id,
        })).filter(h => h.id); // Garante que apenas headings com ID (gerados pelo rehype-slug) são listados

        setToc(headings);
    }, [content]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '0px 0px -80% 0px' }
        );

        toc.forEach((item) => {
            const el = document.getElementById(item.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [toc]);

    if (toc.length === 0) return null;

    return (
        <div className="space-y-4">
            <h4 className="font-semibold text-xs text-gray-900 uppercase tracking-widest">Nesta página</h4>
            <ul className="space-y-3 text-[13px]">
                {toc.map((item, index) => (
                    <li
                        key={index}
                        style={{ paddingLeft: `${(item.level - 2) * 1}rem` }}
                    >
                        <a
                            href={`#${item.id}`}
                            className={`block transition-all duration-200 ${activeId === item.id
                                ? 'text-violet-600 font-semibold translate-x-1'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            {item.text}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
