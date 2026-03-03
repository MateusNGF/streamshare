import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Redefinir Senha | StreamShare",
    description: "Crie uma nova senha para sua conta no StreamShare.",
};

export default function RedefinirSenhaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
