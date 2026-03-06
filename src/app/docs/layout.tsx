import { Metadata } from 'next';
import { getAllDocsMeta } from "@/lib/docs";
import { DocsSidebar } from "@/components/docs/DocsSidebar";

export const metadata: Metadata = {
    title: {
        template: "%s | Ajuda StreamShare",
        default: "Central de Ajuda | StreamShare",
    },
    description: "Guias passo-a-passo, tutoriais e respostas sobre como utilizar o StreamShare e gerir grupos.",
    openGraph: {
        title: "Central de Ajuda | StreamShare",
        description: "Encontre respostas para suas dúvidas sobre o StreamShare.",
        url: "https://streamshare.com.br/docs",
        siteName: "StreamShare Ajuda",
        locale: "pt_BR",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Central de Ajuda | StreamShare",
        description: "Encontre respostas para suas dúvidas sobre o StreamShare.",
    }
};

export default async function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const sections = await getAllDocsMeta();

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-white text-gray-900 w-full antialiased font-sans items-start">
            <DocsSidebar sections={sections} />

            {/* Main Content Area */}
            <main className="flex-1 w-full min-w-0 flex justify-center pb-24 lg:pb-12 pt-6 lg:pt-12 px-4 sm:px-8 lg:px-16">
                <div className="w-full max-w-6xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
