import { notFound } from 'next/navigation';
import { getDocBySlug, getAllDocsMeta } from '@/lib/docs';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/docs/MDXComponents';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface DocPageProps {
    params: { slug: string[] };
}

// Otimização: pré-renderiza as rotas conhecidas em build time
export async function generateStaticParams() {
    const sections = await getAllDocsMeta();
    const paths: { slug: string[] }[] = [];

    sections.forEach((section) => {
        section.items.forEach((item) => {
            paths.push({ slug: item.slug.split('/') });
        });
    });

    return paths;
}

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
    const doc = await getDocBySlug(params.slug);
    if (!doc) return {};

    return {
        title: doc.meta.titulo,
        description: doc.meta.descricao,
        openGraph: {
            title: doc.meta.titulo,
            description: doc.meta.descricao,
        },
    };
}

export default async function DocPage({ params }: DocPageProps) {
    const doc = await getDocBySlug(params.slug);

    if (!doc) {
        notFound();
    }

    return (
        <article className="max-w-none pt-4">
            {/* Breadcrumb simples */}
            <nav className="flex text-sm text-gray-500 mb-8 items-center" aria-label="Breadcrumb">
                <span>Central de Ajuda</span>
                <ChevronRight className="w-4 h-4 mx-1 flex-shrink-0 opacity-50" />
                {doc.meta.seccao && (
                    <>
                        <span className="capitalize">{doc.meta.seccao}</span>
                        <ChevronRight className="w-4 h-4 mx-1 flex-shrink-0 opacity-50" />
                    </>
                )}
                <span className="text-gray-900 font-medium truncate">{doc.meta.titulo}</span>
            </nav>

            <header className="mb-10 pb-10 border-b border-gray-100">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4 font-sans">
                    {doc.meta.titulo}
                </h1>
                {doc.meta.descricao && (
                    <p className="text-lg text-gray-500 leading-relaxed font-sans max-w-2xl">
                        {doc.meta.descricao}
                    </p>
                )}
            </header>

            {/* Corpo da documentação gerado pelo MDX */}
            <div className="prose prose-violet prose-gray pr-4 font-sans max-w-none prose-a:font-medium prose-a:text-violet-600 hover:prose-a:text-violet-500 prose-headings:tracking-tight prose-headings:text-gray-900">
                <MDXRemote source={doc.content} components={mdxComponents} />
            </div>

            <footer className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                <p>Ainda tem dúvidas? <Link href="mailto:suporte@streamshare.com.br" className="text-violet-600 hover:underline">Entre em contacto com o suporte</Link>.</p>
                <p className="mt-4 md:mt-0">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
            </footer>
        </article>
    );
}
