import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Termos de Uso | StreamShare",
    description: "Leia nossos termos e condições gerais de uso da plataforma StreamShare.",
    robots: {
        index: true,
        follow: true,
    }
};

export default function TermosLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
