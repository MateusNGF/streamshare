import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Recuperar Senha | StreamShare",
    description: "Recupere o acesso à sua conta e continue economizando no StreamShare.",
};

export default function EsqueciSenhaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
