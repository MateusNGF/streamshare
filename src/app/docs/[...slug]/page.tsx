import { notFound } from 'next/navigation';
import { getDocBySlug, getAllDocsMeta, getAdjacentDocs } from '@/lib/docs';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/docs/MDXComponents';
import { Metadata } from 'next';
import { TableOfContents } from '@/components/docs/TableOfContents';
import { DocNavigation } from '@/components/docs/DocNavigation';
import { FeedbackWidget } from '@/components/docs/FeedbackWidget';
import { DocBreadcrumb } from '@/components/docs/DocBreadcrumb';
import { DocHeader } from '@/components/docs/DocHeader';
import { DocFooter } from '@/components/docs/DocFooter';

// MDX Plugins
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkGfm from 'remark-gfm';

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

    const { prev: prevDoc, next: nextDoc } = await getAdjacentDocs(doc.slug);
    const githubEditUrl = `https://github.com/MateusNGF/streamshare/edit/main/content/docs/${params.slug.join('/')}.mdx`;

    return (
        <div className="flex xl:gap-12 pb-16">
            <div className="flex-1 min-w-0">
                <article className="max-w-none pt-4">
                    <DocBreadcrumb meta={doc.meta} />
                    <DocHeader meta={doc.meta} />

                    {/* Corpo da documentação gerado pelo MDX */}
                    <div className="prose prose-violet prose-gray pr-4 font-sans max-w-none prose-a:font-medium prose-a:text-violet-600 hover:prose-a:text-violet-500 prose-headings:tracking-tight prose-headings:text-gray-900">
                        <MDXRemote
                            source={doc.content}
                            components={mdxComponents}
                            options={{
                                mdxOptions: {
                                    remarkPlugins: [remarkGfm],
                                    rehypePlugins: [
                                        rehypeSlug,
                                        [rehypeAutolinkHeadings, { behavior: 'wrap' }],
                                        [rehypePrettyCode, { theme: 'github-dark' }]
                                    ]
                                }
                            }}
                        />
                    </div>

                    <FeedbackWidget />
                    <DocNavigation prev={prevDoc} next={nextDoc} />
                    <DocFooter githubEditUrl={githubEditUrl} />
                </article>
            </div>

            <aside className="hidden xl:block w-64 flex-shrink-0 pt-4">
                <div className="sticky top-12">
                    <TableOfContents content={doc.content} />
                </div>
            </aside>
        </div>
    );
}
