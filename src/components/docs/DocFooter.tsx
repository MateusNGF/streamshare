import Link from 'next/link';
import { Github } from 'lucide-react';

interface DocFooterProps {
    githubEditUrl: string;
    lastUpdatedAt?: string;
}

export function DocFooter({ githubEditUrl, lastUpdatedAt = new Date().toLocaleDateString('pt-BR') }: DocFooterProps) {
    return (
        <footer className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4 justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <p className="text-center md:text-left">
                Ainda tem dúvidas? <Link href="mailto:suporte@streamshare.com.br" className="text-violet-600 dark:text-violet-400 hover:underline">Entre em contato com o suporte</Link>.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <Link href={githubEditUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                    <Github className="w-4 h-4" />
                    Editar no GitHub
                </Link>
                <p>Última atualização: {lastUpdatedAt}</p>
            </div>
        </footer>
    );
}
