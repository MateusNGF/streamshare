"use client";

import React, { useState } from 'react';
import { Link as LinkIcon, Check } from 'lucide-react';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
    level: 2 | 3;
}

export const HeadingWithCopy = ({ level, children, id, className, ...props }: HeadingProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!id) return;

        const url = new URL(window.location.href);
        url.hash = id;
        navigator.clipboard.writeText(url.toString());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const Tag = `h${level}` as 'h2' | 'h3';

    return (
        <Tag id={id} className={`group flex items-center gap-2 scroll-mt-24 ${className}`} {...props}>
            {children}
            {id && (
                <button
                    onClick={handleCopy}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-all cursor-pointer"
                    title="Copiar link desta sessão"
                    type="button"
                >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <LinkIcon size={14} />}
                </button>
            )}
        </Tag>
    );
};
