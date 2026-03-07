'use client';

import React, { useEffect, useRef, useId } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
        primaryColor: '#f3e8ff',
        primaryTextColor: '#4c1d95',
        primaryBorderColor: '#8b5cf6',
        lineColor: '#6b7280',
        secondaryColor: '#ede9fe',
        tertiaryColor: '#f5f3ff',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        fontSize: '14px',
    },
});

export function Mermaid({ chart }: { chart: string }) {
    const id = useId().replace(/:/g, '');
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current || !chart) return;

        const render = async () => {
            try {
                const { svg } = await mermaid.render(`mermaid-${id}`, chart.trim());
                if (ref.current) {
                    ref.current.innerHTML = svg;
                }
            } catch (err) {
                if (ref.current) {
                    ref.current.innerHTML = `<pre class="text-red-500 text-sm p-4 bg-red-50 rounded-lg border border-red-200">Erro ao renderizar o diagrama:\n${err}</pre>`;
                }
            }
        };

        render();
    }, [chart, id]);

    return (
        <div
            ref={ref}
            className="my-8 flex justify-center overflow-x-auto rounded-xl border border-violet-100 bg-white p-6 shadow-sm"
        />
    );
}
