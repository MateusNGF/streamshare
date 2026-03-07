import { DocMeta } from '@/lib/docs';

export function DocHeader({ meta }: { meta: DocMeta }) {
    return (
        <header className="mb-12 pb-8 border-b border-gray-100">
            <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 font-sans">
                    {meta.titulo}
                </h1>
                {meta.descricao && (
                    <p className="text-xl text-gray-500 leading-relaxed font-sans max-w-3xl">
                        {meta.descricao}
                    </p>
                )}
            </div>
        </header>
    );
}
