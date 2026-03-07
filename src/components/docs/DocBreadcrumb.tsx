import { ChevronRight } from 'lucide-react';
import { DocMeta } from '@/lib/docs';

export function DocBreadcrumb({ meta }: { meta: DocMeta }) {
    return (
        <nav className="flex text-[13px] text-gray-500 mb-6 items-center font-medium" aria-label="Breadcrumb">
            <span className="hover:text-gray-900 cursor-default transition-colors">Ajuda</span>
            <ChevronRight className="w-3.5 h-3.5 mx-2 flex-shrink-0 opacity-40" />
            {meta.seccao && (
                <>
                    <span className="capitalize hover:text-gray-900 cursor-default transition-colors">{meta.seccao}</span>
                    <ChevronRight className="w-3.5 h-3.5 mx-2 flex-shrink-0 opacity-40" />
                </>
            )}
            <span className="text-violet-600 truncate">{meta.titulo}</span>
        </nav>
    );
}
