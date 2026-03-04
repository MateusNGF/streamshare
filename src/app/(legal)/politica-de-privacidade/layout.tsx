import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Política de Privacidade | StreamShare",
    description: "Saiba como o StreamShare coleta, usa e protege seus dados pessoais.",
    robots: {
        index: true,
        follow: true,
    }
};

export default function PoliticaPrivacidadeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
