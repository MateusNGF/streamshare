import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const DOCS_DIRECTORY = path.join(process.cwd(), 'content', 'docs');

export interface DocMeta {
    titulo: string;
    descricao?: string;
    ordem?: number;
    seccao?: string;
    [key: string]: any;
}

export interface DocFile {
    slug: string;
    meta: DocMeta;
    content: string;
}

// Garante que a pasta base existe
if (!fs.existsSync(DOCS_DIRECTORY)) {
    fs.mkdirSync(DOCS_DIRECTORY, { recursive: true });
}

export async function getDocBySlug(slugPath: string[]): Promise<DocFile | null> {
    const realSlug = slugPath.join('/');
    const fullPath = path.join(DOCS_DIRECTORY, `${realSlug}.mdx`);

    if (!fs.existsSync(fullPath)) return null;

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
        slug: realSlug,
        meta: data as DocMeta,
        content,
    };
}

export interface SidebarSection {
    title: string;
    items: { title: string; slug: string; order: number }[];
}

export async function getAllDocsMeta(): Promise<SidebarSection[]> {
    const sectionsMap = new Map<string, { title: string; slug: string; order: number }[]>();

    // Lê as pastas dentro de content/docs
    if (!fs.existsSync(DOCS_DIRECTORY)) return [];

    const entries = fs.readdirSync(DOCS_DIRECTORY, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.isDirectory()) {
            const sectionName = entry.name;
            const sectionDir = path.join(DOCS_DIRECTORY, sectionName);
            const files = fs.readdirSync(sectionDir).filter(f => f.endsWith('.mdx'));

            const items = files.map(file => {
                const fullPath = path.join(sectionDir, file);
                const fileContents = fs.readFileSync(fullPath, 'utf8');
                const { data } = matter(fileContents);

                return {
                    title: data.titulo || file.replace('.mdx', ''),
                    slug: `${sectionName}/${file.replace('.mdx', '')}`,
                    order: data.ordem || 99,
                };
            }).sort((a, b) => a.order - b.order);

            if (items.length > 0) {
                sectionsMap.set(sectionName, items);
            }
        }
    }

    // Define a ordem desejada das seções
    const sectionOrder = ['introducao', 'assinaturas', 'pagamentos'];

    const result: SidebarSection[] = [];

    for (const sectionKey of sectionOrder) {
        if (sectionsMap.has(sectionKey)) {
            result.push({
                title: formatSectionTitle(sectionKey),
                items: sectionsMap.get(sectionKey) || [],
            });
            sectionsMap.delete(sectionKey);
        }
    }

    // Adiciona qualquer outra seção que não esteja na ordem principal
    for (const [sectionKey, items] of sectionsMap.entries()) {
        result.push({
            title: formatSectionTitle(sectionKey),
            items,
        });
    }

    return result;
}

function formatSectionTitle(key: string): string {
    if (key === 'introducao') return 'Introdução';
    if (key === 'assinaturas') return 'Assinaturas';
    if (key === 'pagamentos') return 'Pagamentos';

    // Capitaliza a primeira letra para os restantes
    return key.charAt(0).toUpperCase() + key.slice(1);
}
