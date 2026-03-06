import { visit } from 'unist-util-visit';

/**
 * Plugin remark que transforma blocos de código `mermaid`
 * em nós JSX <Mermaid chart="..." />, interceptando-os antes
 * que o rehype-pretty-code os processe.
 *
 * Isso é necessário porque rehype-pretty-code transforma qualquer
 * bloco de código fenced — incluindo mermaid — em spans com syntax
 * highlighting, destruindo o conteúdo de texto que o componente
 * Mermaid precisa para renderizar o diagrama.
 */
export function remarkMermaid() {
    return (tree: any) => {
        visit(tree, 'code', (node: any, index: number | undefined, parent: any) => {
            if (node.lang !== 'mermaid') return;
            if (index === undefined || !parent) return;

            // Substitui o nó `code` por um nó JSX <Mermaid chart="..." />
            const mermaidJsxNode: any = {
                type: 'mdxJsxFlowElement',
                name: 'Mermaid',
                attributes: [
                    {
                        type: 'mdxJsxAttribute',
                        name: 'chart',
                        value: node.value,
                    },
                ],
                children: [],
                data: { _mdxExplicitJsx: true },
            };

            parent.children.splice(index, 1, mermaidJsxNode);
        });
    };
}
