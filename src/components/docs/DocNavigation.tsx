import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DocNavigationProps {
    prev: { slug: string; title: string } | null;
    next: { slug: string; title: string } | null;
}

export function DocNavigation({ prev, next }: DocNavigationProps) {
    if (!prev && !next) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 py-8 border-t border-gray-200">
            {prev ? (
                <Link
                    href={`/docs/${prev.slug}`}
                    className="flex flex-col gap-2 p-4 rounded-xl border border-gray-200 hover:border-violet-500 hover:bg-violet-50 transition-colors group"
                >
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500 group-hover:text-violet-600">
                        <ChevronLeft className="w-4 h-4" />
                        Anterior
                    </div>
                    <div className="font-semibold text-gray-900 line-clamp-1 ml-6">
                        {prev.title}
                    </div>
                </Link>
            ) : <div />}

            {next && (
                <Link
                    href={`/docs/${next.slug}`}
                    className="flex flex-col items-end gap-2 p-4 rounded-xl border border-gray-200 hover:border-violet-500 hover:bg-violet-50 transition-colors group text-right"
                >
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500 group-hover:text-violet-600">
                        Próximo
                        <ChevronRight className="w-4 h-4" />
                    </div>
                    <div className="font-semibold text-gray-900 line-clamp-1 mr-6">
                        {next.title}
                    </div>
                </Link>
            )}
        </div>
    );
}
